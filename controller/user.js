import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario";

const JWT_SECRET = "f1naancial!";

export const getFollowing = async (req, res) => {
  try {
    console.log(req.params);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const users = await Usuario.paginate({}, { page, limit: 10 });

    return res.send(users.docs);
  } catch (e) {
    return res.status(500).json({ stauts: "Erro!", error: e });
  }
};

export const getUserById = async (req, res) => {
  try {
    const _id = req.params._id;
    const user = await Usuario.findOne({ _id });
    console.log(_id);
    res.json(user);
  } catch (e) {
    return res.status(500).json({ stauts: "Erro!", erorr: e });
  }
};

export const update = async (request, response) => {
  try {
    // endpoint/key/value/_id

    const key = request.body.key;
    const value = request.body.value;
    const id = request.params._id;

    const update = { [key]: value, updatedAt: Date.now() };

    await Usuario.findByIdAndUpdate(
      id,
      update,
      { useFindAndModify: true, new: true },
      function (err, docs) {
        if (err) {
          return response.json({ error: true, message: "falhou no mongoose" });
        } else {
          return response.json({
            Message: "Usuario atualizado com sucesso",
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

export const deleteUser = async (req, res) => {
  try {
    const id = req.params._id;

    await Usuario.findByIdAndDelete(id).then(() => {
      return res.json({ message: "Usuario deletado com sucesso!" });
    });
  } catch (e) {
    return res.status(400).json({ status: "Erro!", error: e });
  }
};

export const deleteAll = async (req, res) => {
  try {
    await Usuario.deleteMany().then(() => {
      return res.json({
        message: "Todos os usuarios foram deletados com sucesso!",
      });
    });
  } catch (e) {
    return res.status(400).json({ status: "Erro!", error: e });
  }
};
