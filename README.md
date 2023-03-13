📰 News Project (MEAN Boilerplate)
==============

NewsProject is a web application that allows users to read and share news articles on a variety of topics. This project
was created as a university project for the MEAN stack with Angular 1.

🚀 Getting Started
------------------

To get started with the project, follow these steps:

### Prerequisites

Before running the application, you will need to have the following installed on your machine:

- Node.js
- MongoDB

### Installation

1. Clone the repository: `git clone https://github.com/Alessandroinfo/NewsProject.git`
2. Navigate to the project directory: `cd NewsProject`
3. Install dependencies for the server side: `npm install`
4. Navigate to the client directory: `cd client`
5. Install dependencies for the client side: `bower install`
6. Return to the project directory: `cd ..`
7. Edit the `config/env.json` file with the details of your running MongoDB instance, like this:

```json
{
  "dev": {
    "MONGO_URI": "your-mongodb-uri",
    "MONGO_PORT": "your-mongodb-port",
    "MONGO_DB": "news_project_db",
    "REDIRECT_ROUTES": {
      "home": "/#/",
      "admin": "/#/admin"
    }
  },
  "prod": {
    "MONGO_URI": "your-mongodb-uri",
    "MONGO_PORT": "your-mongodb-port",
    "MONGO_DB": "news_project_db",
    "REDIRECT_ROUTES": {
      "home": "/#/",
      "admin": "/#/admin"
    }
  }
}
```

Replace the `your-mongodb-uri` and `your-mongodb-port` placeholders with the appropriate details for your MongoDB
instance.

### Usage

Before running the application, make sure your MongoDB instance is running.

1. Start the server by running `node server.js` from the `server` directory.
2. Start the client by running `npx http-server` from the `client` directory.
3. Open your browser and navigate to `http://localhost:8080/` to use the application.

Note that the server and client must be running simultaneously for the application to function properly.

🤖 Technologies Used
--------------------

The following technologies were used to build the project:

- MongoDB
- Express.js
- Angular 1
- Node.js

🎓 Contributing
---------------

Contributions to the project are welcome! If you'd like to contribute, please fork the repository and submit a pull
request with your changes.

📝 Credits
----------

This project was created by Alessandroinfo as a university project for the MEAN stack with Angular 1.
