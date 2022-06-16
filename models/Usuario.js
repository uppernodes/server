import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    role: {
      type: [String],
      default: ["Subscriber", "Instructor"],
      enum: ["Subscriber", "Instructor", "Admin"],
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "/avatar.png",
    },
    password: {
      type: String,
      min: 6,
      max: 64
    },
    apple: {
      authorizationCode: {
        type: String,
      },
      email: {
        type: String,
      },
      fullName: {
        familyName: {
          type: String,
        },
        givenName: {
          type: String,
        },
        middleName: {
          type: String,
        },
        namePrefix: {
          type: String,
        },
        nameSuffix: {
          type: String,
        },
        nickname: {
          type: String,
        },
      },
      identityToken: {
        type: String,
      },
      realUserStatus: {
        type: Number,
      },
      state: {
        type: String,
      },
      user: {
        type: String,
      },
    },
    google: {
      id: {
        type: String,
      },
      email: {
        type: String,
      },
      family_name: {
        type: String,
      },
      given_name: {
        type: String,
      },
      locale: {
        type: String,
      },
      name: {
        type: String,
      },
      picture: {
        type: String,
      },
      verified_email: {
        type: Boolean,
      },
    },
    stripe_account_id: "",
    stripe_seller: {},
    stripeSession: {},
    passwordResetCode: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

export default mongoose.model("User", userSchema);
