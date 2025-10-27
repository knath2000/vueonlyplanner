# Product Context – Only Task Manager

## Why This Project Exists

Traditional project and task management tools often feel sterile, uninspired, or overly utilitarian—especially on Apple platforms where many apps mimic standard macOS/iOS conventions. Only Task Manager is designed to break this mold by offering a playful, game-like experience that makes managing projects and tasks visually engaging and enjoyable.

## Problems It Solves

- **Lack of Engagement:** Many productivity tools fail to motivate users or make task management enjoyable.
- **Visual Monotony:** Standard UI patterns can feel repetitive and uninspiring, especially for creative or visually-oriented users. **The enhanced modal styling, animated background blur, and task card grid directly address this.**
- **Fragmented Real-Time Collaboration:** Existing tools may lack seamless, real-time sync across devices, especially on Apple platforms.
- **Limited Customization:** Users often cannot personalize their workflow or interface in a meaningful, visually rich way.
- **Lack of Data Ownership/Privacy:** Users may not have clear ownership or secure storage of their personal project and task data.

## How It Should Work

- Users will need to sign up or log in to access and manage their projects and tasks. Authentication options include email/password and Google Sign-in.
- Users can create, organize, and manage projects and tasks with animated, interactive UI elements (e.g., draggable cards, animated progress meters). **Tasks are displayed as visually distinct rectangular cards in a responsive grid.**
- All actions (add, edit, move, complete) provide immediate, playful visual feedback. **Modal interactions now include an animated background blur and smooth fade-in/out animations.**
- Navigation between Dashboard, Project List, and Task Details is fluid and animated, enhancing the sense of flow.
- Real-time updates via Supabase Realtime ensure all devices and users see changes instantly, supporting continuity for their authenticated account.

## User Experience Goals

- **Effortless Onboarding:** Users can easily sign up or log in to start using the app.
- **Delight:** Every interaction should feel rewarding, with smooth, game-like animations and vibrant visuals. **The smooth page transitions, modal fade-in/out, animated background blur, and refined modal styling enhance the sense of delight.**
- **Clarity:** Despite the playful UI, information hierarchy and task/project status should always be clear. **The task card grid improves the visual organization and clarity of tasks.**
- **Responsiveness:** The app must feel fast and fluid, especially on Safari for iOS/macOS.
- **Accessibility:** All users, including those with disabilities, should be able to use the app effectively. **Implemented prefers-reduced-motion checks to disable animations for users who prefer reduced motion.**
- **Customization:** Users should feel empowered to personalize their experience within the app’s unique visual language.
- **Security & Privacy:** Users should feel confident that their data is securely stored and accessible only to them through their authenticated account, enforced by Supabase Row Level Security.

## References

- Top-rated animated web apps and game UI patterns (as surfaced in recent Google Search results)
- Apple’s Human Interface Guidelines for web and animation performance
