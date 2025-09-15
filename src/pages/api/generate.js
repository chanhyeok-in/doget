import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import sharp from 'sharp';
import fetch from 'node-fetch';

const STABILITY_API_KEY = 'sk-xcGYVKETT9F9vEZAKZaNSsqGJVZfSMpJK5iMKLFFXWyoTkLp';
const API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ errors: [err.message] });
      return;
    }

    try {
      const imageFile = files.image[0];
      const prompt = fields.prompt[0];

      if (!imageFile) {
        return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
      }

      const imageBuffer = fs.readFileSync(imageFile.filepath);

      const resizedImageBuffer = await sharp(imageBuffer)
        .resize(1024, 1024)
        .jpeg()
        .toBuffer();

      const formData = new FormData();
      formData.append('init_image', resizedImageBuffer, 'resized-image.jpeg');
      formData.append('init_image_mode', 'IMAGE_STRENGTH');
      formData.append('image_strength', 0.35);
      formData.append('text_prompts[0][text]', prompt || 'A cute pet');
      formData.append('cfg_scale', 7);
      formData.append('samples', 1);
      formData.append('steps', 30);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          Accept: 'application/json',
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Stability AI sends errors in a `errors` array or a `message` field.
        const errorMessage = data.errors ? data.errors[0] : (data.message || 'Stability AI API Error');
        throw new Error(errorMessage);
      }

      res.status(200).json(data);

    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: [error.message] });
    }
  });
}
