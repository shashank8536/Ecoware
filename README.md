# Ecoware
EcoWare – A Smart Garbage Collection and Citizen Complaint Management System that connects citizens with municipal authorities through collection alerts, complaint reporting, real-time status tracking, and intelligent waste management.



## 📄 Project Synopsis

The official project synopsis of **EcoWare – Smart Garbage Collection and Citizen Complaint Management System** is available below.

It includes the project overview, motivation, proposed innovations, project planning, and technical requirements.

 **[View / Download Project Synopsis (PDF)](docs/EcoWare_Project_Synopsis.pdf)**

## About the Project

EcoWare is a group project developed to make garbage collection and complaint management easier for both citizens and municipal staff.

The main idea is to provide a common platform where citizens can report garbage-related problems, check collection schedules, and track their complaints. Municipal staff can use the system to manage assigned tasks, update work status, and handle citizen complaints.

## Main Features

### Citizen Portal
- User registration and login.
- Citizen dashboard to view important information.
- Report garbage problems by submitting complaints.
- Check garbage collection schedules.
- Track submitted complaints.
- Submit feedback about waste collection services.
- Manage personal profile.

### Municipal Staff Portal
- Staff dashboard to view assigned work.
- View and manage assigned tasks.
- Update task completion status.
- Check work schedules.
- View notifications.
- Access staff profile and task history.

## Technologies Used

The project is being developed using the MERN stack and related web technologies.

- **MongoDB** – Database
- **Express.js** – Backend framework
- **React.js** – Frontend development
- **Node.js** – Backend runtime
- **HTML, CSS and JavaScript** – Web development
- **Vite** – Frontend development and build tool
- **Git and GitHub** – Version control and team collaboration

## Project Structure

The project is organized into separate folders to keep the frontend, backend, and documentation easy to manage.

```text
EcoWare/
│
├── docs/
│   └── Project documents
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── router/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   └── Backend source code
│
└── README.md
```

## How to Run the Project

Follow these steps to run the frontend on your local system.

**1. Clone the repository**

```bash
git clone https://github.com/shashank8536/Ecoware.git
```

**2. Open the project folder**

```bash
cd Ecoware
```

**3. Move into the frontend folder**

```bash
cd frontend
```

**4. Install the required packages**

```bash
npm install
```

**5. Start the development server**

```bash
npm run dev
```

Open the local URL shown in your terminal to view the application in your browser.

## Team Collaboration

EcoWare is being developed collaboratively by our project team. Each member works on an assigned part of the project using separate Git branches.

We use GitHub to manage the source code, share updates, and combine everyone's work into the main branch.

## Project Status

The citizen and municipal staff frontend modules have been merged into the main branch. Backend development and integration are being handled separately as part of the ongoing project work.

## Future Improvements

- Connect the frontend with the backend and database.
- Implement complete authentication and role-based access.
- Add real-time complaint and collection status updates.
- Improve garbage collection tracking.
- Integrate AI-based features for smarter complaint handling and waste management.