# Municipal Citizen Complaint Portal

A frontend demo of a **Municipal Citizen Complaint & Service Portal**
designed to make civic issue reporting, complaint tracking, ward
information, garbage pickup requests, emergency reporting, and municipal
field operations easier to understand and manage.

> **Project type:** College / demo project\
> **Technology:** HTML, CSS, JavaScript\
> **Backend:** Not required for the demo\
> **Data storage:** Browser `localStorage` for selected demo data

------------------------------------------------------------------------

## Features

### Citizen Features

-   Citizen registration and login interface
-   Mobile number and OTP verification UI
-   Citizen dashboard with complaint statistics
-   Register a new civic complaint
-   Complaint tracking with complaint IDs
-   Complaint status and timeline
-   My Complaints section
-   Photo/video evidence support and previews
-   Location, ward, and landmark information
-   Ward Map
-   Ward condition and ward officer information
-   Safety & Cleanliness information
-   Municipal News
-   Notifications and toast messages
-   Hindi / English language toggle
-   Light / Dark mode
-   Civic Help / AI-style website assistant
-   Reopen resolved complaints
-   Citizen feedback and rating
-   Smart complaint category / priority suggestions

------------------------------------------------------------------------

## Garbage Pickup Request

The portal includes a dedicated **Request Garbage Pickup** section for
citizens.

A citizen can provide:

-   Area / locality
-   Ward
-   Landmark
-   Garbage type
-   Detailed pickup request
-   Location information
-   Image evidence
-   Multiple image previews

After submission, the demo generates a pickup request ID and displays a
success message.

The section also provides three pickup contact numbers in the interface.
These are **demo contact numbers** and should be replaced with official
municipal numbers before production use.

------------------------------------------------------------------------

## Emergency Complaints

The portal includes an emergency complaint workflow with fields for:

-   Emergency type
-   Ward
-   Description
-   Emergency reporting
-   Response tracking

Emergency and officer-specific tools are separated from the normal
citizen experience through role-based UI behavior.

------------------------------------------------------------------------

## Officer Section

The Officer Section provides a separate interface for municipal staff.

It includes:

-   Officer login
-   Officer ID / name
-   Mobile number and OTP verification
-   Officer profile
-   Officer workload information
-   Complaint management
-   Complaint tracking
-   Officer replies
-   Ward operations
-   Worker / field-team location information
-   Live work tracking UI
-   Ward condition information
-   Emergency complaint handling

The current project is a **frontend demonstration**. Officer
authentication and live field tracking are not connected to a real
municipal backend.

------------------------------------------------------------------------

## Admin Section

The Admin area contains administrative and monitoring features such as:

-   Complaint management
-   Complaint statistics
-   Ward-wise information
-   Workload information
-   Resolution information
-   Monitoring views

Admin functionality is presented as part of the demonstration portal and
should be connected to a secure backend for real deployment.

------------------------------------------------------------------------

## Municipal News

The Municipal News section displays civic updates and demonstration
municipal information.

It includes:

-   Latest civic news
-   Municipal work updates
-   Complaint / work hotspot information
-   Refresh updates action
-   External news references

Some displayed hotspot counts are explicitly marked as **demonstration
portal data**.

------------------------------------------------------------------------

## Ward Map

The Ward Map provides a visual civic-information area containing
information such as:

-   Current ward
-   Ward condition
-   Complaint counts
-   Ward officer name
-   Officer designation
-   Officer ID
-   Officer mobile information

The map and field-location portions are demonstration interfaces unless
connected to a real map, GPS, and municipal backend service.

------------------------------------------------------------------------

## Technology

This project intentionally uses simple web technologies so that
beginners can understand and modify it.

  Technology     Purpose
  -------------- ----------------------------------------------------
  HTML5          Page structure and forms
  CSS3           Layout, responsive design, animations and themes
  JavaScript     Interaction, validation, navigation and demo logic
  LocalStorage   Browser-side demo data persistence

No framework is required.

------------------------------------------------------------------------

## Project Structure

The main project is currently delivered as a single organized HTML file:

``` text
Municipal-Citizen-Complaint-Portal/
│
├── Municipal_Citizen_Complaint_Portal_v10_Clean_Organized.html
└── README.md
```

The HTML file contains:

``` text
HTML
 ├── Navigation
 ├── Citizen Registration / Login
 ├── Citizen Dashboard
 ├── Complaint Registration
 ├── My Complaints
 ├── Ward Map
 ├── Safety & Cleanliness
 ├── Garbage Pickup
 ├── Emergency Complaints
 ├── Municipal News
 ├── Admin
 └── Officer Section

CSS
 ├── Layout
 ├── Components
 ├── Responsive Design
 ├── Light / Dark Theme
 └── Page-specific styles

JavaScript
 ├── Navigation
 ├── Login / Registration
 ├── OTP demo validation
 ├── Complaint management
 ├── Notifications
 ├── Language switching
 ├── Theme switching
 ├── Garbage pickup requests
 ├── Officer functionality
 └── AI-style website assistant
```

------------------------------------------------------------------------

## How to Run

No server is required for the basic demo.

### Option 1 --- Open directly

1.  Download the HTML file.
2.  Open it in Chrome, Edge, Firefox, or another modern browser.
3.  Use the navigation menu to explore the portal.

### Option 2 --- Run with VS Code

1.  Open the project folder in VS Code.
2.  Install the **Live Server** extension if desired.
3.  Right-click the HTML file.
4.  Select **Open with Live Server**.

------------------------------------------------------------------------

## Demo OTP

The current frontend demo uses:

``` text
123456
```

This OTP is only for demonstration.

### Important

Do **not** use a hard-coded OTP in a real application.

For production, OTP verification should be handled by a secure backend
and an approved SMS/OTP service.

------------------------------------------------------------------------

## Demo Data and Security

This project is a frontend demonstration and should **not** be treated
as a production municipal system.

Some information is stored in browser `localStorage`, and several
features are simulated on the frontend.

For example:

-   Login is not connected to a real authentication server.
-   OTP is a demo value.
-   Officer authentication is not production authentication.
-   Live worker locations are demonstration data.
-   Municipal news / hotspot information may be demonstration content.
-   Complaint records are stored locally in the browser in relevant demo
    flows.
-   Contact numbers in the garbage pickup section should be replaced
    with official numbers.

Do not store sensitive citizen information in browser storage in a real
deployment.

------------------------------------------------------------------------

## Production Upgrade Plan

For a real municipal deployment, the frontend should be connected to a
secure backend.

Recommended architecture:

``` text
Citizen Browser
      │
      ▼
Frontend Website
      │
      ▼
Secure API / Backend
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
Users Complaints   Notifications
DB     DB             Service
 │
 ├── Ward / Officer Data
 ├── Work Orders
 ├── GPS / Field Teams
 └── Analytics
```

Possible production additions:

-   Secure user authentication
-   Real SMS OTP service
-   Role-based authorization
-   Municipal database
-   Cloud image/video storage
-   Real GPS tracking
-   Real map API
-   Push notifications
-   Email/SMS notifications
-   Officer mobile application
-   Admin API
-   Audit logs
-   Rate limiting
-   Server-side validation
-   Secure file upload
-   Encryption
-   Backup and recovery

------------------------------------------------------------------------

## Customization

Because the project uses plain HTML, CSS, and JavaScript, beginners can
customize it easily.

### Change the portal name

Search for:

``` html
Municipal Corporation
```

and replace it with the required municipal organization name.

### Change colors

Look for the CSS variables near the beginning of the stylesheet:

``` css
:root {
    ...
}
```

The main theme variables can be changed there.

### Change demo OTP

Search for:

``` javascript
const DEMO_OTP = '123456';
```

Remember that this should only be used for a demo.

### Change garbage pickup contacts

Search for the garbage pickup contact section and replace the demo phone
numbers with the official municipal contact numbers.

### Add a new page

The main navigation and page sections use simple HTML elements and
JavaScript page switching, making it possible to add another service
page without introducing a frontend framework.

------------------------------------------------------------------------

## Accessibility and Responsive Design

The portal is designed with:

-   Responsive layouts
-   Mobile-friendly forms
-   Clear buttons and labels
-   Light / dark mode
-   High-contrast friendly styling
-   Keyboard-friendly form controls
-   Visible status messages

Accessibility should still be tested with real screen readers and
accessibility tools before production deployment.

------------------------------------------------------------------------

## Important Project Notes

This project is intended as a **working frontend prototype / college
project**.

It demonstrates how a municipal complaint portal could organize citizen
services and officer workflows in one interface.

It does not by itself provide:

-   Real municipal authentication
-   Real government database integration
-   Guaranteed emergency response
-   Real-time GPS tracking
-   Real SMS/email delivery
-   Production-grade security

These require backend services and authorized municipal integrations.

------------------------------------------------------------------------

## Contributing

If this project is published on GitHub, contributors can improve it by:

1.  Forking the repository.
2.  Creating a new branch.
3.  Making changes.
4.  Testing the website in a modern browser.
5.  Committing the changes.
6.  Opening a Pull Request.

Example:

``` bash
git clone <repository-url>
cd Municipal-Citizen-Complaint-Portal

git checkout -b feature/new-service

git add .
git commit -m "Add new municipal service"

git push origin feature/new-service
```

------------------------------------------------------------------------

## Suggested GitHub Repository Name

``` text
municipal-citizen-complaint-portal
```

Alternative:

``` text
smart-municipal-complaint-portal
```

------------------------------------------------------------------------

## Team

### Code Debuggers

This project was developed by the team **Code Debuggers**.

**Team Members:**

1. **Rajat Kapoor**
2. **Pranjal Mishra**
3. **Arpit Yadav**
4. **Prajjuwal Shukla**

---

## License

For a college/demo repository, choose a license that matches your
intended use.

For example:

``` text
MIT License
```

If the project contains third-party assets, code, images, or external
content, verify their licenses before publishing the repository.

------------------------------------------------------------------------

## Author

**Municipal Citizen Complaint Portal**

A civic-service portal prototype for demonstrating digital complaint
registration, tracking, ward services, garbage pickup requests,
emergency reporting, and municipal officer workflows.
