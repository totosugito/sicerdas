flowchart TD
    Start[Start App]
    AuthCheck[Check Authentication]
    LoginPage[Display Login Page]
    Dashboard[Display Dashboard]
    NavContent[Content Management]
    NavProfile[User Profile]
    NavChat[Ai Chat Feature]
    NavReports[Reporting and Moderation]
    NavAdmin[Admin Panel]
    Logout[Logout]

    Start --> AuthCheck
    AuthCheck -->|Authenticated| Dashboard
    AuthCheck -->|Not Authenticated| LoginPage
    LoginPage -->|Submit Credentials| AuthCheck
    Dashboard --> NavContent
    Dashboard --> NavProfile
    Dashboard --> NavChat
    Dashboard --> NavReports
    Dashboard --> NavAdmin
    Dashboard --> Logout
    Logout --> LoginPage