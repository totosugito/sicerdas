# App Flow Document for Sicerdas

## Onboarding and Sign-In/Sign-Up

When a brand-new user first visits the Sicerdas platform, they arrive at a clean landing page that introduces the site as a learning resource center. From here, they can choose to sign up or log in by clicking the buttons in the top-right corner. To create a new account, the user selects the Sign Up option and is taken to a form where they enter their name, email address, and choose a secure password. After submitting the form, they receive a confirmation email with a link to verify their account. Once they click the verification link, they are automatically signed in and redirected to the home page.

If an existing user returns to the site, they choose Sign In and enter their registered email and password. Upon successful authentication, they are taken directly to the main dashboard. If they forget their password, they click the Forgot Password link on the sign-in form. They then enter their email address and receive a password reset link by email. Clicking that link brings up a page where they set a new password, after which they can sign in as normal.

At any point after signing in, the user can sign out by clicking on their avatar in the header and selecting the Sign Out option. This action clears their session and returns them to the landing page.

## Main Dashboard or Home Page

After logging in, users land on the main dashboard, which greets them with a top navigation bar showing the Sicerdas logo on the left, a search field in the center, and a user avatar plus language selector on the right. Along the left side of the screen is a vertical menu that lists Content Library, AI Chat, Profile, and, if the user has elevated rights, Administration. The central area of the page displays a paginated grid of book cards, each showing a cover image, title, author, and like count. Above the grid are controls for switching between grid and list views, applying filters by category, and sorting by popularity or date added.

From this dashboard, moving to other parts of the app is straightforward. Clicking on any book card takes the user to that book’s details. Selecting AI Chat in the sidebar opens the interactive chat page. Clicking Profile brings up personal settings, and if the user has teacher or admin roles, the Administration link leads to specialized management panels.

## Detailed Feature Flows and Page Transitions

When a user wants to explore a specific book in more depth, they click its card on the dashboard. They transition to the Book Detail page, which shows full metadata including description, publication details, and a preview of the content. On this page, the user can download the book file by clicking Download or view it directly in the embedded reader. They can also express appreciation by clicking the Like icon. If they encounter inappropriate content, they select Report Content, which opens a simple form to describe the issue and submit it. After submission, they see a confirmation message and can return to browsing.

Teachers and administrators have access to the Content Management page through the Administration menu. When they open this section, they see a table of all books along with Edit and Delete buttons beside each entry. To add a new book, they click the Create New Book button at the top of the page. This opens a multi-step form where they enter title, author, category, description, upload a cover image, and attach the book file. They then save the entry, and the new book appears immediately in the table and the public library.

The AI Chat feature is available to all authenticated users by clicking the AI Chat link in the sidebar. This takes them to a conversational interface where they type questions about course materials or book topics. Each time the user submits a query, the AI assistant responds in the chat stream. Users can scroll through past messages or clear the conversation to start fresh.

Administrators have a dedicated Reporting Review page under the Administration menu. This page lists all user-submitted reports against content. Clicking on any report opens details about the reporter’s comments and the associated book. Administrators can then choose to dismiss the report or take action by removing or editing the content. Once they complete the review, they return to the list view to handle the next report.

## Settings and Account Management

Users can update their personal information by clicking Profile in the sidebar. The Profile page displays their name, email, and language preference. They can change these details and save the form to apply updates. A separate Change Password section lets the user enter their current password and set a new one. Saving either form shows a success notification and keeps the user on the Profile page.

Notification preferences are managed from the same Profile area. Users toggle email notifications for things like new content announcements or report follow-ups. After saving their settings, they see an acknowledgment message. From any of these settings pages, the user can navigate back to the Content Library or AI Chat by using the sidebar links.

## Error States and Alternate Paths

If a user enters incorrect credentials on the sign-in form, the page displays an error banner stating that the email or password is invalid. On the sign-up form, if they use an email already in the system or a password that fails validation rules, inline warnings appear next to the offending fields. During password reset, using an unrecognized email prompts an error message that asks the user to check their address.

Throughout the app, if the network connection drops, a full-width banner appears at the top indicating that connectivity is lost. While offline, attempts to fetch data result in a retry mechanism, and the user can continue to view any content already loaded. If a non-admin user tries to access an Administration page, they see a permission denied screen that explains they need higher privileges. Finally, navigating to an undefined route shows a friendly 404 page with a link back to the home dashboard.

## Conclusion and Overall App Journey

A typical new user journey begins at the landing page, proceeds through email verification, and lands on the main dashboard filled with educational content. From there, the user can browse and filter books, dive into individual titles, and engage with an AI assistant for real-time help. Teachers and administrators enjoy additional flows for creating and managing content as well as reviewing reports. In their profile, users maintain personal details and notification preferences. Along the way, helpful error messages guide users past mistakes or connectivity issues. Over time, the platform enables learners to discover, consume, and interact with educational materials in a seamless, intuitive way.