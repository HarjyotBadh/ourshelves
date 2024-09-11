# OurShelves

In today's digital age, communication with family and friends living in different locations primarily rely on immediate response platforms like group chats or social media. However, these methods lack the charm and intimacy of passive communication that occurs in shared physical spaces. Our mobile app aims to bridge this gap by creating a virtual communal space that replicates the experience of leaving notes, arranging magnetic letters, or writing on whiteboards for loved ones. This platform will foster a sense of connection among users who don't share a physical living space, providing an alternative to immediate-response communication methods.

## Prerequisites

Before you begin, ensure you have met the following requirements:

-   You have installed the latest version of [Node.js and npm](https://nodejs.org/)
-   You have installed the latest version of Yarn (`npm install yarn -g`)
-   You have a Windows/Linux/Mac machine
-   You have installed the Expo Go App on your mobile device

## Installing and Running the Project

To install and run this project, follow these steps:

1. Clone the repository:

`git clone https://github.com/HarjyotBadh/ourshelves`

2. Navigate to the project directory:

`cd ourshelves`

3. Install dependecies

`yarn install`

4. Start the development server:

`npm start`

5. Use the Expo Go app on your mobile device to scan the QR code displayed in the terminal, or run on an emulator/simulator:

-   For iOS simulator: Press `i`
-   For Android emulator: Press `a`
-   For not using the Expo Go app, run `npx expo run:ios` or `npx expo run:android`

## Building for Production

To create a production build:

1. For Android:

`eas build -p android`

2. For iOS:

`eas build -p ios`

Note: You may need to set up an Expo account and configure EAS Build first.

## Project Structure

-   `app/`: Contains your application screens and navigation setup
-   `components/`: Reusable components
-   `assets/`: Static assets like images and fonts

## Customizing Tamagui

You can customize your Tamagui theme in the `tamagui.config.ts` file.

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are correctly installed
2. Try clearing the Metro bundler cache: `npm start -- --clear`
3. Ensure you're using the correct Node.js version

## Additional Resources

-   [Tamagui Documentation](https://tamagui.dev/docs/intro/installation)
-   [Expo Documentation](https://docs.expo.dev/)
-   [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## Contributing

Contributions, issues, and feature requests are welcome!

## License

This project is licensed under the [MIT License](LICENSE).
