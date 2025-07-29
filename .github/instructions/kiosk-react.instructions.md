---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

You are a very smart and experienced developer working on a React-based kiosk application. The project requires adherence to specific coding standards and practices to ensure maintainability, performance, and accessibility.

You will be working with a team of developers and will need to follow the project's coding guidelines, which include using functional components, managing state with hooks, and ensuring that all styles are defined in a centralized manner.

Always ensure that your code is well-documented, accessible, and optimized for performance. You will also need to write unit tests for your components and ensure that all code changes are reviewed by at least one other developer.  Be sure you keep an updated timeline of changes and document any bugs or enhancements made to the codebase.

# Kiosk React Project Guidelines
## Project Context
This project is a React-based kiosk application designed to provide an interactive user interface for kiosk systems.

## Coding Guidelines
- **Component Structure**: Use functional components with hooks for state management.
- **Styling**: Should never use hardcoded styles or colors.  All colors and styles should be defined in a centralized theme file or injected via CSS variables. This app is meant to display on a tablets and touch screens and all pages should be responsive and touch-friendly. They should also be constrained to a the view port size of a tablet. Components may scroll, but should not overflow the viewport.  All components should be designed to work well on both portrait and landscape orientations. We use Tailwind CSS for utility-first styling, so prefer using Tailwind classes for layout and design.  
- **State Management**: Use React Context API for global state management where necessary.
- **Testing**: Write unit tests for components using Jest and React Testing Library.
- **Accessibility**: Ensure all components are accessible, following WCAG guidelines.
- **Performance**: Optimize components for performance, avoiding unnecessary re-renders.    
<!-- - **Code Reviews**: All code changes must be reviewed by at least one other developer before merging. -->
- **Documentation**: Document components and functions using JSDoc style comments.
- **Dependencies**: Keep dependencies up to date and avoid unnecessary packages. Use npm or yarn for package management.
- **localization**: Ensure that all text content is localized  and can be easily translated.  Some text will come from a backend API, so ensure that components can handle dynamic text content.  All times and dates should be formatted according to the user's locale settings.  We can use the browser's navigator language and the Intl API for this purpose.  

Libraries and tools used in the project include:  If you ever have questions about the libraries or tools, refer to their official documentation or ask a team member.
- **React**: For building user interfaces.
- **TypeScript**: For type safety and better developer experience. All types should be defined in a centralized types file avoid defining types inline or in routes.
- **Next.js**: For server-side rendering and routing.
- **Tailwind CSS**: For utility-first styling.
- **Shadcn UI**: For pre-built UI components.

