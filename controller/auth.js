import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario";
import validator from "email-validator";

import Token from "../models/Token";

import queryString from "query-string";
import stripe from "stripe";

import { v4 as uuid } from "uuid";

const JWT_SECRET = "f1naancial!";

import AWS from "aws-sdk";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

function generateJwt(email, payload) {
  const token = jwt.sign(payload, JWT_SECRET);

  return {
    token,
  };
}

function checkRefreshTokenIsValid(email, refreshToken) {
  const storedRefreshTokens = Token.find(email) ?? [];

  return storedRefreshTokens.some((token) => token === refreshToken);
}

function invalidateRefreshToken(email, refreshToken) {
  const storedRefreshTokens = Token.find(email) ?? [];

  console.log(storedRefreshTokens);
}

export const sessions = async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.json({
      error: true,
      code: "credentials.invalid",
      message: "Credenciais invalidas",
    });
  }

  const user = await Usuario.findOne({ email }).lean();

  if (!user) {
    return response.json({
      error: true,
      message: "E-mail ou senha invalidos.",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!user || !passwordMatch) {
    return response.json({
      error: true,
      message: "E-mail ou senha invalidos.",
    });
  }

  const { token } = generateJwt(email, {
    _id: user._id,
    name: user.name,
    email: user.email,
    permissions: user.permissions,
    roles: user.roles,
  });

  const rt = uuid();

  const refreshToken = new Token({
    refreshToken: rt,
    email,
  });
  await refreshToken.save();

  return response.json({
    _id: user._id,
    name: user.name,
    token,
    refreshToken: rt,
    permissions: user.permissions,
    roles: user.roles,
  });
};

export const refresh = async (request, response) => {
  const email = request.user;
  const { refreshToken } = request.body;

  const user = await Usuario.findOne({ email }).lean();

  if (!user) {
    return response.status(401).json({
      error: true,
      message: "User not found.",
    });
  }

  if (!refreshToken) {
    return response.status(401).json({
      error: true,
      message: "Refresh token is required.",
    });
  }

  const isValidRefreshToken = checkRefreshTokenIsValid(email, refreshToken);

  if (!isValidRefreshToken) {
    return response
      .status(401)
      .json({ error: true, message: "Refresh token is invalid." });
  }

  invalidateRefreshToken(email, refreshToken);

  const { token, refreshToken: newRefreshToken } = generateJwtAndRefreshToken(
    email,
    {
      permissions: user.permissions,
      roles: user.roles,
    }
  );

  return response.json({
    token,
    refreshToken: newRefreshToken,
    permissions: user.permissions,
    roles: user.roles,
  });
};

export const update = async (request, response) => {
  try {
    const key = request.params.key;
    const value = request.params.value;

    const id = request.params.userId;

    // const a = key[0];
    // const b = value[0];

    const update = { [key]: value };

    await Usuario.findByIdAndUpdate(
      id,
      update,
      { useFindAndModify: true, new: true },
      function (err, docs) {
        if (err) {
          return response.json({ error: true, message: "falhou no mongoose" });
        } else {
          return response.json({
            Message: "Atualizado com sucesso",
            user: docs,
          });
        }
      }
    )
      .clone()
      .catch((error) => {
        return response.json({ error: true, message: "falhou no mongoose" });
      });
  } catch (e) {
    console.error(e);
  }
};

export const getUserById = async (request, response) => {
  try {
    const id = request.params.userId;
    const user = await Usuario.findById(id);
    return response.json(user);
  } catch (error) {
    return response.json({ error: true, message: "ops" });
  }
};

export const me = async (request, response) => {
  try {
    const email = request.user;

    console.log(request.user);

    const user = await Usuario.findOne({ email }).lean();

    if (!user) {
      return response
        .status(401)
        .json({ error: true, message: "User not found." });
    }

    return response.json({
      _id: user._id,
      name: user.name,
      email,
      permissions: user.permissions,
      roles: user.roles,
    });
  } catch (error) {
    return response.status(500).json({ status: "Error!", error });
  }
};

export const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    const user = await Usuario.findOne({ email }).lean();

    if (email.length == 0) {
      return response.json({ status: "Erro!", error: "Qual é o seu email?" });
    }

    if (!user) {
      return response.json({ status: "Erro!", error: "Telefone invalido" });
    }

    if (password.length == 0) {
      return response.json({
        status: "Erro!",
        error: "Qual é a sua password?",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        {
          id: user._id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
        },
        JWT_SECRET
      );

      const userData = {
        id: user._id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        tipo: user.tipo,
      };

      const data = { token: token, user: userData };

      return response.json({
        status: "Usuário logado com sucesso!",
        data: data,
      });
    } else {
      return response.json({ status: "Erro!", error: "password incorreta" });
    }
  } catch (e) {
    return response.status(500).json({ status: "Erro!", error: e });
  }
};

export const register = async (request, response) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return response.json({
        status: "Erro!",
        error: "Dados invalidos",
      });
    }

    if (name.length === 0) {
      return response.json({
        status: "Erro!",
        error: "Você precisa inserir seu nome",
      });
    }

    if (email.length === 0) {
      return response.json({
        status: "Erro!",
        error: "Você precisa inserir seu email",
      });
    }

    if (!validator.validate(email)) {
      return response.json({
        status: "Erro!",
        error: "Você precisa inserir um email",
      });
    }

    if (password.length < 8) {
      return response.json({
        status: "Erro!",
        error: "Sua senha deve conter no minimo 8 digitos",
      });
    }

    const e_email = await Usuario.findOne({ email }).lean();
    if (e_email) {
      return response.json({
        status: "Erro!",
        error: "Esse email já foi registrado",
      });
    }

    const crypted_password = await bcrypt.hash(password, 10);

    const user = new Usuario({
      name,
      email,
      password: crypted_password,
    });
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      {
        subject: email,
        expiresIn: "30d",
      }
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    const data = { token: token, user: userData };

    return response.json({ status: "Usuário criado com sucesso!", data });
  } catch (e) {
    return response.status(500).json({ status: "Erro!", error: e });
  }
};

export const google = async (request, response) => {
  try {
    const { name, email, avatar, google } = request.body;

    const registered = await Usuario.findOne({ "google.email": google.email });
    if (registered) {
      const token = jwt.sign(
        {
          id: registered._id,
          name: registered.name,
          email: registered.google.email,
          avatar: registered.picture,
        },
        JWT_SECRET
      );

      const userData = {
        id: registered._id,
        name: registered.name,
        email: registered.google.email,
        avatar: registered.avatar,
        google: registered.google,
      };

      const data = { token: token, user: userData };

      return response.json({
        status: "Usuário autenticado com sucesso!",
        data,
      });
    }

    if (name.length === 0) {
      return response.json({
        status: "Erro!",
        error: "Qual seu nome",
      });
    }

    if (email.length === 0) {
      return response.json({
        status: "Erro!",
        error: "Qual seu email",
      });
    }

    const user = new Usuario({
      name,
      avatar,
      google,
    });
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.google.email,
        avatar: user.picture,
      },
      JWT_SECRET
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.google.email,
      avatar: user.avatar,
      google: user.google,
    };

    const data = { token: token, user: userData };

    return response.json({ status: "Usuário criado com sucesso!", data });
  } catch (e) {
    return response.status(500).json({ status: "Erro!", error: e });
  }
};

export const apple = async (request, response) => {
  try {
    const { name, apple } = request.body;

    const registered = await Usuario.findOne({ "apple.user": apple.user });
    if (registered) {
      const token = jwt.sign(
        {
          id: registered._id,
          name: registered.name,
          email: registered.apple.email,
          avatar: registered.avatar,
        },
        JWT_SECRET
      );

      const userData = {
        id: registered._id,
        name: registered.name,
        email: registered.apple.email,
        avatar: registered.avatar,
        apple: registered.apple,
      };

      const data = { token: token, user: userData };

      return response.json({
        status: "Usuário autenticado com sucesso!",
        data,
      });
    }

    const user = new Usuario({
      name,
      apple,
    });
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.apple.email,
      },
      JWT_SECRET
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.apple.email,
      apple: user.apple,
    };

    const data = { token: token, user: userData };

    return response.json({ status: "Usuário criado com sucesso!", data });
  } catch (e) {
    return response.status(500).json({ status: "Erro!", error: e });
  }
};

export const sendEmailTest = async (request, response) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: ["ricardofsdomene@icloud.com"],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
              <html>
                <h1>Reset password link</h1>
                <p>Please use the following to reset your password</p>
              </html>
            `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Password reset link",
      },
    },
  };

  const emailSent = SES.sendEmail(params).promise();

  emailSent
    .then((data) => {
      console.log(data);
      return response.json({ ok: true });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const makeInstructor = async (req, res) => {
  try {
    const user = await Usuario.findById(req.body.id).exec();

    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({ type: "express" });

      user.stripe_account_id = account.id;
      user.save();
    }

    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: "account_onboarding",
    });

    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email,
    });

    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
  } catch (err) {
    console.log("MAKE INSTRUCTOR ERR", err);
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await Usuario.findById(req.user._id)
      .select("-password")
      .exec();
    console.log("CURRENT_USER", user);
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ status: "Erro!", error: err });
  }
};

export const getAccountStatus = async (req, res) => {
  try {
    const user = await Usuario.findById(req.body.id).exec();
    console.log("USER =>", user);

    const account = stripe.accounts.retrieve(user.stripe_account_id);

    console.log("ACCOUNT =>", account);

    if (!account.charges_enabled) {
      return res.status(401).send("Unauthorized");
    } else {
      //
    }
  } catch (err) {
    return res.status(500).json({ status: "Erro!", error: err });
  }
};
