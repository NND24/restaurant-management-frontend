import axios from "axios";

export async function generateImageDescription(imageUrl) {
  try {
    const res = await axios.post("http://127.0.0.1:8000/caption", null, {
      params: { url: imageUrl },
    });
    return res.data.caption;
  } catch (err) {
    console.error("Error generating image caption:", err);
    throw err;
  }
}
