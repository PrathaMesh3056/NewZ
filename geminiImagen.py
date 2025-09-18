import vertexai
from vertexai.preview.vision_models import ImageGenerationModel

# Initialize Vertex AI with your project + location
vertexai.init(
    project="gen-lang-client-0415088766",   # Replace with your Project ID
    location="us-central1"       # Imagen is available only in us-central1
)

# Load Imagen model
model = ImageGenerationModel.from_pretrained("imagen-3.0")

# Prompt for image generation
prompt = "A cyberpunk city with glowing neon lights and flying cars."

print("⏳ Generating image...")
images = model.generate_images(
    prompt=prompt,
    number_of_images=1,
    size="1024x1024"  # Options: 512x512, 768x768, 1024x1024
)

# Save image(s)
for i, img in enumerate(images):
    img.save(f"generated_image_{i}.png")
    print(f"✅ Saved generated_image_{i}.png")
