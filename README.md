# Video Druum Machine

A creative web application that turns YouTube videos into an interactive drum machine/step sequencer. Create unique musical compositions by triggering video segments in a grid-based interface.
![image](https://github.com/user-attachments/assets/fe2a26f2-e3c1-4e89-88c4-acd5d1a06650)


## Features

### Three-State Step Sequencer
- **Play State (Blue)**: Triggers video playback from the row's start time
- **Stop State (Orange)**: Halts video playback
- **Off State (Gray)**: No action
- Click to cycle through states: Off → Play → Stop → Off
- Quarter notes have darker background when off

### Floating Video Player
- Draggable window with title bar
- Fullscreen support (⤨/⤧ buttons)
- Clean YouTube player interface
- Auto-switching between active video tracks
- Hover-reveal controls in fullscreen mode

### Time Control
- Precise time input (mm:ss.ms format)
- Debounced updates for smooth operation
- Real-time input validation
- Start/end time validation
- Immediate visual feedback

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/jdreetz/video-druum-machine.git
cd video-druum-machine
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Built With
- Next.js
- TypeScript
- YouTube Player API

## Deployment
The application is deployed on Netlify and can be accessed at: https://video-druum-machine.windsurf.build
