# Planner Sidekick AI

## About The Project

This project is a personal calendar application, inspired by Google Calendar, but designed to be smarter, more intuitive, and free of frustrating quirks. It started from a simple annoyance: Google Calendar's habit of assuming an event ending after 9 PM should continue until 9 AM the next day. This project is about building a calendar that adapts to the user, not the other way around.

The core functionality allows users to add, manage, and group tasks and events. The real magic, however, will come from an integrated agentic AI chatbot built with LangChain. This AI assistant will help with complex scheduling and planning, turning a simple calendar into a true sidekick.

### Planned AI Features

*   **Automated Schedule Population**: Feed the AI a syllabus or document, and it will automatically populate your calendar with important dates.
*   **Collaborative Task Management**: Coordinate chores with roommates or tasks with a team, letting the AI handle fair division and scheduling.

## Built With

This project is built with a modern, full-stack architecture:

*   **Frontend**:
    *   [React](https://reactjs.org/)
    *   [Vite](https://vitejs.dev/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn-ui](https://ui.shadcn.com/)
*   **Backend**:
    *   [Express.js](https://expressjs.com/)
    *   [MongoDB](https://www.mongodb.com/)
*   **AI**:
    *   [LangChain](https://www.langchain.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed on your machine. Using [nvm](https://github.com/nvm-sh/nvm) is recommended to manage Node versions.

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your-username/planner-sidekick-ai.git
    cd planner-sidekick-ai
    ```

2.  **Install Backend Dependencies**
    ```sh
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```sh
    cd ../frontend
    npm install
    ```

4.  **Set Up Environment Variables**

    The backend requires a MongoDB connection string. Create a `.env` file in the `/backend` directory:

    ```sh
    # /backend/.env
    MONGODB_URI=----------
    ```

    > **Note**: The `.env` file is included in `.gitignore` to prevent your database credentials from being committed to version control.

## Running the Application

You will need to run the frontend and backend servers in two separate terminals.

1.  **Start the Backend Server**
    ```sh
    # From the /backend directory
    npm run dev
    ```
    Your Express server should now be running, typically on `http://localhost:3000`.

2.  **Start the Frontend Development Server**
    ```sh
    # From the /frontend directory
    npm run dev
    ```
    Your React application will be available at `http://localhost:5173` (or another port if 5173 is in use).