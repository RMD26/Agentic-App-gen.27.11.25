<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Agentic AI App Builder

A powerful AI-powered application builder using Gemini 3 models with an agentic swarm architecture. Build complete web applications through natural language descriptions.

View your app in AI Studio: <https://ai.studio/apps/drive/1cqlyf8UUAz2AXhOMg8q32jZX6Qs88eIb>

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

### Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure API Key:**
   - Get your Gemini API key from: <https://aistudio.google.com/apikey>
   - Open `.env.local` in the project root
   - Replace `your_api_key_here` with your actual API key:

     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Click "New Project" to start building with AI

## Build for Production

```bash
npm run build
npm run preview
```

## Troubleshooting

### Application won't load

- Ensure `.env.local` exists with a valid `GEMINI_API_KEY`
- Check browser console for errors
- Verify Node.js version is 18 or higher

### API errors

- Verify your API key is valid at <https://aistudio.google.com/apikey>
- Check that the key has proper permissions
- Ensure you're not exceeding API rate limits

### Build errors

- Run `npm install` to ensure all dependencies are installed
- Clear the `dist` folder and rebuild
- Check TypeScript errors with `npx tsc --noEmit`
