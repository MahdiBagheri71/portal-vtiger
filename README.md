# Portal-Vtiger

Portal-Vtiger is a mobile application designed to provide a seamless interface for managing Vtiger CRM functionalities. This application allows users to access and manage their CRM data on-the-go.

## Features

- Access and manage documents
- View and update HelpDesk tickets
- Manage FAQs
- User authentication and profile management
- Multi-language support

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them:
Node.js npm or yarn React Native CLI Expo CLI (optional)


### Installing


A step by step series of examples that tell you how to get a development environment running:


Clone the repository:


```bash
git clone https://github.com/mahdibagheri71/portal-vtiger.git
```
Install dependencies:

```bash
cd portal-vtiger

npm install
```
or
```bash
bash

yarn install
```

Start the development server:

```bash
npm start
```

or

```bash
yarn start
```

## Building the Project

This project is bootstrapped with Expo. To build the project for production, follow these steps:

### Android Build

To create a build for Android, run:

```bash
expo build:android
```

You will be prompted to choose between building an APK or an Android App Bundle. Follow the instructions on the screen to complete the build.

### iOS Build

To create a build for iOS, run:
```bash
expo build:ios
```

You will need to provide your Apple Developer account credentials and choose whether to build for simulator or an actual device. Follow the instructions on the screen to complete the build.

### Web Build

To create a web build, run:
```bash
expo build:web
```
This will generate a web-build directory with your compiled project that can be deployed to a web server.

### Ejecting from Expo

If you need to customize the native code for Android and iOS, you can eject from Expo:

```bash
expo eject
```
This will create android and ios directories in your project with the native code, which you can then modify as needed.

Please note that you must have an Expo account and be logged in to access some of the build services. For more information on building with Expo, refer to the [Expo documentation](https://docs.expo.dev/build/setup/).


## Usage

After starting the development server, you can open the application in a web browser or through the Expo app on your mobile device.

## Contributing

We welcome contributions to the Portal-Vtiger project. Please read our contributing guidelines before submitting your pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Acknowledgments

- Thanks to all the contributors who have helped with this project.
- Special thanks to the Vtiger community for their support and collaboration.
