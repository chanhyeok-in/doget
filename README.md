# AR Pet Memorial

This is a Next.js application that allows users to generate an image of their pet and view it in an AR (Augmented Reality) environment.

## Key Features

*   **Create React App to Next.js Migration:** The project was migrated from Create React App to Next.js to leverage its features like API routes and simplified architecture.
*   **Integrated Backend:** The Express.js middleware was replaced with a Next.js API route (`/api/generate`) to handle image processing and communication with the Stability AI API.
*   **HTTPS for WebXR:** A local HTTPS development environment was set up using a self-signed SSL certificate to meet the security requirements of WebXR.
*   **Desktop Fallback:** For devices that do not support AR, a desktop-friendly 3D viewer is provided as a fallback, allowing interaction with the generated image via mouse controls.
*   **Image-to-Image Generation:** Utilizes the Stability AI API to generate new images of a pet based on a user-provided photo and text prompt.
*   **AR Viewing:** On supported mobile devices, users can view the generated image in their real-world environment using WebXR.

## Getting Started

### Prerequisites

*   Node.js
*   npm

### Installation

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

This project requires a secure context (HTTPS) for the WebXR features to work. A script is provided to run the Next.js development server with an SSL proxy.

1.  Run the HTTPS development server:
    ```bash
    npm run dev:https
    ```
2.  Open your browser and navigate to `https://localhost:3002`.
3.  You will see a browser warning about the self-signed certificate. Please accept the warning to proceed.

**Note:** The standard Next.js server runs on port `3003`, and the HTTPS proxy forwards requests from port `3002`.

## Available Scripts

*   `npm run dev`: Runs the standard Next.js development server on `http://localhost:3003`. (AR features will not work).
*   `npm run dev:https`: Runs the Next.js server and an HTTPS proxy. Use this for testing AR features. Access at `https://localhost:3002`.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts a Next.js production server.
*   `npm run lint`: Runs the Next.js linter.