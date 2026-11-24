# 🎬 Movie Explorer

A modern, responsive movie discovery web application that allows users to search for movies, explore different genres, view detailed movie information, and save their favorite movies.

Built using **HTML, CSS, JavaScript, jQuery, AJAX, and the TMDB API**.

---

## ✨ Features

### 🔎 Movie Search
- Search movies by title.
- Retrieve movie information dynamically from the TMDB API.
- Display search results without reloading the page.

### 🎭 Genre Filtering
- Browse popular movies by default.
- Filter movies by genre, including:
  - Action
  - Adventure
  - Animation
  - Comedy
  - Crime
  - Drama
  - Fantasy
  - Horror
  - Mystery
  - Romance
  - Science Fiction
  - Thriller
- Explore movies by genre without entering a search query.

### 📅 Release Year Filter
- Filter movies by release year.
- Validate year input before sending requests.

### ↕️ Sorting
Sort movies using:
- Relevance
- Title: A–Z
- Title: Z–A
- Year: Newest
- Year: Oldest

### 🎞️ Movie Details
Click a movie to view additional information:
- Movie title
- Release date
- Rating
- Runtime
- Genres
- Director
- Cast
- Original language
- Synopsis

Movie details are displayed in an interactive modal.

### ❤️ Favorites
- Add movies to favorites.
- Remove movies from favorites.
- View saved movies in a separate section.
- Clear all favorites.
- Save favorites using browser `localStorage`, so they remain available after refreshing the page.

### 📄 Pagination
- Navigate between movie result pages.
- Load additional results from the API.

### 📱 Responsive Design
- Modern dark-themed interface.
- Responsive movie cards.
- Mobile-friendly layout.
- Interactive hover effects and animations.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structure of the application |
| CSS3 | Styling, layout, animations and responsiveness |
| JavaScript | Application logic and interactivity |
| jQuery | DOM manipulation and event handling |
| AJAX | Asynchronous API requests |
| TMDB API | Movie information and images |
| LocalStorage | Saving favorite movies |

---

## 🌐 API

This application uses **The Movie Database (TMDB) API** to retrieve movie information.

API documentation: https://developer.themoviedb.org/docs

The application uses the following endpoints:

| Endpoint | Purpose |
|---|---|
| `/movie/popular` | Retrieve popular movies |
| `/search/movie` | Search movies by title |
| `/discover/movie` | Discover movies by genre or release year |
| `/movie/{movie_id}` | Retrieve detailed movie information |
| `/genre/movie/list` | Retrieve available movie genres (available through the API) |

Movie posters and backdrops are loaded using TMDB image URLs.

---

## 📁 Project Structure

```text
Movie-Explorer/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── config.js
│   └── script.js
│
├── images/
│   └── anakin.png
│
└── README.md
```

### File Description

- **index.html** — Main HTML page containing the application structure.
- **css/style.css** — Application styling, animations and responsive layouts.
- **js/config.js** — Stores the TMDB API configuration.
- **js/script.js** — Handles API requests, searching, filtering, sorting, pagination, movie details and favorites.
- **images/anakin.png** — Hero section image.

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Open the Project Folder

```bash
cd Movie-Explorer
```

### 3. Configure the TMDB API

You need a TMDB API Read Access Token to retrieve movie information.

Create an account on TMDB and obtain your API Read Access Token from your account settings.

Create or open:

```text
js/config.js
```

### 4. Run the Application

Open `index.html` in your browser.

For a better development experience, you can use the VS Code Live Server extension.

---

## 🧭 How to Use

1. Open the Movie Explorer application.
2. Browse popular movies displayed on the homepage.
3. Enter a movie title in the search bar to find a specific movie.
4. Select a genre to explore movies from that category.
5. Enter a release year to narrow down the results.
6. Use the sorting menu to organize movies.
7. Click a movie card to view its details.
8. Click the heart icon to add a movie to your favorites.
9. Visit the **My Favorites** section to view saved movies.
10. Use pagination to explore additional results.

---

## 🎨 Design

Movie Explorer uses a modern cinematic interface featuring:

- Dark navy background.
- Lime green and violet accent colors.
- Space Grotesk and DM Sans typography.
- Movie poster cards.
- Animated visual elements.
- Responsive layouts for different screen sizes.

---

## 📌 Project Purpose

The purpose of this project is to demonstrate practical knowledge of frontend web development and asynchronous communication with external APIs.

It combines HTML, CSS, JavaScript, jQuery and AJAX to create an interactive application that retrieves and displays real movie data without requiring page reloads.

---

## 📄 Credits

- Movie information and images: [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Fonts: Google Fonts
- AJAX and DOM manipulation: jQuery

This product uses the TMDB API but is not endorsed or certified by TMDB.