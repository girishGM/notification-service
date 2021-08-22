# notification-service

Back-end service ( REST APIs) to send email using kafka producer, consumer with schema registry.

## Get Started

To start get the code from the git hub repo then follow below steps:

## Run Project

### 1. Using docker compose
    
 ### Docker compose file
    Please update the ALARM_EMAIL key under notificationservice,  
    this will be used to send an email when processing of a message is failed.
    
 ### Run docker compose
     Run docker conatiners from the root of the project, using below command :
     
     ```bash
        docker-compose up 
      ```     

### 2. Using local system
  ### Installation

  Ensure you have [Node.js] installed on your computer, if you want to run this project on your local and not using the docker container.

  Install the dependencies by running the following from the root of the project:

  ### npm

  ```bash
    npm install 
  ```

  ### Environment property file
    create a .env file using provided .env.sample file configured all environment related variables.


  ## To start the application 

  ### npm

  ```bash
    npm run start 
   ```


## Consume API
- Consume the API from [Postman]

- In localhost -- http://localhost:7070/sendEmail


## Architecture diagram

![alt text](https://raw.githubusercontent.com/girishGM/notification-service/main/NotificationService.png?raw=true)




## Sequence diagram

![alt text](https://github.com/girishGM/notification-service/blob/main/NotificationServiceFlow.png?raw=true)

