// const mongoose = require("mongoose");
// const mongoosePaginate = require("mongoose-paginate-v2");

// const courseSchema = new mongoose.Schema(
//   {
//     slug: {
//       type: String,
//       lowercase: true,
//     },
//     url: {
//       public: String,
//     },
//     creator: {
//       _id: mongoose.Types.ObjectId,
//     },
//     thumbnail: {
//       image: String,
//       video: String,
//     },
//     freePreview: {
//       type: Boolean,
//       default: true,
//     },
//     name: {
//       minlength: 3,
//       maxlength: 160,
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     categoria: {
//       type: String,
//     },
//     keywords: {
//       type: [String],
//     },
//     models: {
//       type: [
//         {
//           type: {
//             type: String,
//             enum: ["Gratuito", "Pago"],
//           },
//           value: {
//             type: Number,
//             default: 0,
//           },
//           metodo: {
//             type: String,
//             enum: ["Daily", "Weekly", "Monthly", "Yearly", "Permanent"],
//           },
//         },
//       ],
//     },
//     topics: {
//       type: [String],
//     },
//     content: {
//       metadata: {
//         type: [Object],
//       },
//       modules: [Object],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const lessonSchema = new mongoose.Schema(
//   {
//     slug: {
//       type: String,
//       lowercase: true,
//     },
//     videoLink: {
//       public: String,
//     },
//     freePreview: {
//       type: Boolean,
//       default: true,
//     },
//     name: {
//       type: String,
//     },
//     description: {
//       type: String,
//     },
//     keywords: {
//       type: [String],
//     },
//     models: {
//       type: [
//         {
//           type: {
//             type: String,
//             enum: ["Gratuito", "Pago"],
//           },
//           value: {
//             type: Number,
//             default: 0,
//           },
//           metodo: {
//             type: String,
//             enum: ["Daily", "Weekly", "Monthly", "Yearly", "Permanent"],
//           },
//         },
//       ],
//     },
//     topics: {
//       type: [String],
//     },
//     content: {
//       metadata: {
//         type: [Object],
//       },
//       modules: [Object],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// courseSchema.plugin(mongoosePaginate);

// module.exports = mongoose.model("Course", courseSchema);

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { ObjectId } = mongoose.Schema;

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    content: {
      type: {},
      minlength: 200,
    },
    video: {},
    free_preview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 6,
      maxlength: 120,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      minlength: 6,
      maxlength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    content: {
      type: {},
      minlength: 200,
    },
    price: {
      type: Number,
    },
    image: {},
    category: String,
    published: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
    },
    instructor: {
      type: ObjectId,
      ref: "User",
    },
    lessons: [lessonSchema],
  },
  {
    timestamps: true,
  }
);

courseSchema.plugin(mongoosePaginate);

export default mongoose.model("Course", courseSchema);
