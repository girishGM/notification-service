# notification-service

Back-end service ( REST APIs) to send email using kafka producer, consumer with schema registry.

## Get Started

To start get the code from the git hub repo then follow below steps:

## Run Project

### 1. Not using docker container
  ### Environment property file
    create a .env file or use the .env.sample file to put all enviorment related variables
    
 ### Docker compose file
    Please update the ALARM_EMAIL key under notificationservice,  this will use to send the email when system got any error or processing of a message is failed.

### 2. Not using docker container
  ### Installation

  Ensure you have [Node.js] installed on your computer, if you want to run this project on your local and not using the docker container.

  Install the dependencies by running the following from the root of the project:

  ### npm

  ```bash
    npm install 
  ```

  ## To start the application 

  ### npm

  ```bash
    npm run dev 
   ```


## Consume API
- Consume the API from [Postman]

- In localhost -- http://localhost:7070/sendEmail






