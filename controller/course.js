import Course from "../models/Course";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import slugify from "slugify";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

export const create = async (req, res) => {
  try {
    console.log(req.body);

    const alreadyExists = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });

    if (alreadyExists) {
      res.json({
        success: false,
        message: "Infelizmente já existe um curso com esse nome",
      });
    } else {
      const course = new Course({
        slug: slugify(req.body.name),
        instructor: req.userId,
        ...req.body,
      });

      await course.save();

      res.status(201).json({
        success: true,
        message: "Curso criado com sucesso!",
        data: course,
      });
    }
  } catch (e) {
    return res.status(500).json({ status: "Erro!", error: e });
  }
};

export const get = async (req, res) => {
  try {
    const slug = req.params.slug;
    const course = await Course.findOne({ slug });

    if (!course) {
      return res.json({
        error: true,
        message: "Curso não encontrado.",
      });
    }

    res.json(course);
  } catch (e) {
    return res.status(500).json({ stauts: "Erro!", erorr: e });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const _id = req.params._id;
    const course = await Course.findOne({ _id });
    res.json(course);
  } catch (e) {
    return res.status(500).json({ stauts: "Erro!", erorr: e });
  }
};

export const getCoursesByInstructorId = async (req, res) => {
  try {
    const userId = req.userId;
    const courses = await Course.find({ instructor: userId });
    console.log(courses);
    res.json(courses);
  } catch (error) {
    return res.status(500).json({ stauts: "Erro!", erorr: e });
  }
};

export const update = async (req, res) => {
  try {
    const { slug } = req.params;

    let name = req.body.name;

    console.log(req.body);

    const course = await Course.findOne({ slug }).exec();
    const alreadyExists = await Course.findOne({ name });
    if (alreadyExists.name === course.name) {
      //
    } else if (alreadyExists) {
      res.json({ message: "Infelizmente já existe um curso com esse nome" });
    }

    // console.log("COURSE FOUND => ", course);

    if (req.userId != course.instructor) {
      return res.status(400).send("Unauthorized");
    }

    console.log(req.body);

    if (req.body.name !== course.name) {
      console.log("nome diferente");
    } else {
      const updated = await Course.findOneAndUpdate({ slug }, req.body, {
        new: true,
      }).exec();
      res.json(updated);
    }
  } catch (e) {
    res.status(500).json({ status: "Erro!", error: e });
  }
};

export const updateCreate = async (request, response) => {
  try {
    // endpoint/_id

    // body = {
    //   creator: {
    //     _id: user._id,
    //   },
    //   name,
    //   description,
    //   category,
    //   keywords: palavrasChave,
    //   models: modelos,
    // }

    const { creator, name, description, category, keywords, models } =
      request.body;

    const id = request.params._id;

    const update = {
      creator,
      name,
      description,
      category,
      keywords,
      models,
      updatedAt: Date.now(),
    };

    await Course.findByIdAndUpdate(
      id,
      update,
      { useFindAndModify: true, new: true },
      function (err, docs) {
        if (err) {
          return response.json({ error: true, message: "falhou no mongoose" });
        } else {
          return response.json({
            status: "Curso atualizado com sucesso!",
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

export const deleteCourse = async (req, res) => {
  try {
    const id = req.params.id;

    await Course.findByIdAndDelete(id).then(() => {
      return res.json({ message: "Curso deletado com sucesso!" });
    });
  } catch (e) {
    return res.status(400).json({ status: "Erro!", error: e });
  }
};

export const deleteAll = async (req, res) => {
  try {
    await Course.deleteMany().then(() => {
      return res.json({
        message: "Todos os cursos foram deletados com sucesso!",
      });
    });
  } catch (e) {
    return res.status(400).json({ status: "Erro!", error: e });
  }
};

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image)
      return res.status(400).json({ status: "Erro!", error: "No image" });

    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];

    const params = {
      Bucket: "uppernodes-lms",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }

      res.send(data);
    });
  } catch (e) {
    res.status(400).json({ status: "Erro!", error: e });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { image } = req.body;

    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(300);
      }

      res.send({ ok: true });
    });
  } catch (e) {
    res.status(500).json({ status: "Erro!", error: e });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (req.file) {
      console.log(req.file);
    }

    console.log("req.user._id", req.userId);
    console.log(req.params.instructorId);

    console.log(req.body);

    if (req.userId !== req.params.instructorId) {
      return res.status(401).send("Unauthorized");
    }

    const { video } = req.body;

    if (!video)
      return res.status(301).json({ status: "Erro!", error: "No video" });

    const params = {
      Bucket: "uppernodes-lms",
      Key: `${nanoid()}.${video.type.split("/")[1]}`,
      Body: readFileSync(video.path),
      ACL: "public-read",
      ContentType: video.type,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(402);
      }

      res.send(data);
    });
  } catch (e) {
    res.status(403).json({ status: "Erro!", error: e });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    console.log(req.body);

    const { Bucket, Key } = req.body;

    if (!video) return res.status(400).send("No video");

    return res.status(200).send("Ok");

    const params = {
      Bucket: Bucket,
      Key: Key,
    };

    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }

      console.log(data);
      res.send({ ok: true });
    });
  } catch (e) {
    res.status(500).json({ status: "Erro!", error: e });
  }
};

export const addLesson = async (req, res) => {
  try {
    const { slug, instructorId } = req.params;
    const { title, content, video } = req.body;

    console.log("params", slug, instructorId);
    console.log("body", title, content, video);

    if (req.userId != instructorId) {
      return res.status(500).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        $push: { lessons: { title, content, video, slug: slugify(title) } },
      },
      { new: true }
    )
      .populate("instructor", "_id name")
      .exec();

    res.json(updated);
  } catch (e) {
    res.status(50).json({ status: "Erro!", error: e });
  }
};
