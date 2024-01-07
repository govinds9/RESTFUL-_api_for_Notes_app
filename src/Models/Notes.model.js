import mongoose,{Schema} from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  
  });
  
  // Add a text index on the 'title' and 'content' fields for searching
  noteSchema.index({ title: 'text', content: 'text' });
  
  export const Note = mongoose.model('Note', noteSchema);