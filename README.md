# Square Mile Team Maker Web

This project is a Vue.js application designed to help users generate balanced teams from a list of players and their attributes. The application allows users to input player data in CSV format, specify the number of teams, and choose the balancing criteria for team generation.

## Features

- Input player data with attributes in a textarea.
- Specify the maximum number of teams and players per team.
- Choose from three team generation options: 
  - Most balanced teams
  - Balanced but random
  - Random
- Display the generated teams and their respective players.

## Project Structure

```
square-mile-team-maker-web
├── .github
│   └── workflows
│       └── deploy.yml
├── src
│   ├── App.vue
│   ├── main.ts
│   ├── components
│   │   ├── TeamInput.vue
│   │   ├── TeamResults.vue
│   │   └── TeamControls.vue
│   ├── types
│   │   └── index.ts
│   └── utils
│       └── teamGenerator.ts
├── public
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/square-mile-team-maker-web.git
   ```

2. Navigate to the project directory:
   ```bash
   cd square-mile-team-maker-web
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Run the application locally:
   ```bash
   npm run serve
   ```

## Usage

- Open the application in your browser.
- Paste the player data in the specified format into the textarea.
- Set the maximum number of teams and players per team.
- Select the desired team generation option.
- Click "Generate Teams" to see the results.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.