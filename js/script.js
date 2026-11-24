$(function () {
    "use strict";

    // ==========================================
    // 1. ELEMENTS AND CONFIGURATION
    // ==========================================

    const $grid = $("#movie-grid");
    const $status = $("#status");
    const $pagination = $("#pagination");
    const $modal = $("#movie-modal");
    const $modalContent = $("#modal-content");

    const FAVORITES_KEY = "movieExplorerFavorites";
    const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
    const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

    // TMDB genre IDs
    const GENRES = {
        action: 28,
        adventure: 12,
        animation: 16,
        comedy: 35,
        crime: 80,
        documentary: 99,
        drama: 18,
        family: 10751,
        fantasy: 14,
        history: 36,
        horror: 27,
        music: 10402,
        mystery: 9648,
        romance: 10749,
        "science fiction": 878,
        "sci-fi": 878,
        thriller: 53,
        war: 10752,
        western: 37
    };

    let currentSearchTerm = "";
    let currentYear = "";
    let currentPage = 1;
    let totalPages = 1;
    let currentMovies = [];

    let searchRequest = null;
    let detailRequest = null;
    let activeRequestNumber = 0;

    // ==========================================
    // 2. FAVORITES
    // ==========================================

    function favorites() {
        try {
            const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY));
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    function saveFavorites(items) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
        renderFavorites();
    }

    function isFavorite(id) {
        return favorites().some(movie => Number(movie.id) === Number(id));
    }

    function toggleFavorite(movie) {
        let list = favorites();

        if (isFavorite(movie.id)) {
            list = list.filter(item => Number(item.id) !== Number(movie.id));
        } else {
            list.unshift({
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path || null,
                release_date: movie.release_date || "",
                vote_average: movie.vote_average || 0
            });
        }

        saveFavorites(list);

        // Refresh movie cards so the heart icons update.
        sortAndDisplay(currentMovies);
    }

    function renderFavorites() {
        const list = favorites();

        $("#favorites-count").text(list.length);
        $("#empty-favorites").toggle(list.length === 0);

        displayMovies(list, $("#favorites-grid"));
    }

    // ==========================================
    // 3. GENERAL HELPERS
    // ==========================================

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character]));
    }

    function showLoading(message) {
        $status.removeClass("error")
            .prop("hidden", false)
            .html(
                '<span class="spinner"></span><span>' +
                escapeHtml(message) +
                '</span>'
            );

        $grid.empty();
        $pagination.empty();
        $("#results-count").text("");
    }

    function showMessage(message, error = false) {
        $status.toggleClass("error", error)
            .prop("hidden", false)
            .text(message);

        $grid.empty();
        $pagination.empty();
        $("#results-count").text("");
    }

    function hideStatus() {
        $status.prop("hidden", true).empty();
    }

    function yearNumber(date) {
        const match = String(date || "").match(/\d{4}/);
        return match ? Number(match[0]) : 0;
    }

    function getGenreId() {
        const selected = String($("#genre-filter").val() || "all")
            .toLowerCase()
            .replace(/[-_]/g, " ")
            .trim();

        if (selected === "all") {
            return null;
        }

        return GENRES[selected] || null;
    }

    function getMovieYear(movie) {
        return movie.release_date
            ? movie.release_date.substring(0, 4)
            : "Unknown";
    }

    // ==========================================
    // 4. TMDB AJAX HELPER
    // ==========================================

    function tmdbRequest(endpoint, data = {}) {
        return $.ajax({
            url: API_URL + endpoint,
            method: "GET",
            dataType: "json",

            headers: {
                Authorization: "Bearer " + API_TOKEN,
                accept: "application/json"
            },

            data: {
                language: "en-US",
                ...data
            }
        });
    }

    // ==========================================
    // 5. LOAD MOVIES
    // ==========================================

    function searchMovies(term = "", page = 1, year = "") {
        currentSearchTerm = term;
        currentPage = page;
        currentYear = year;

        loadMovies(page);
    }

    function loadMovies(page = 1) {
        if (searchRequest) {
            searchRequest.abort();
        }

        const requestNumber = ++activeRequestNumber;

        currentPage = page;

        const genreId = getGenreId();

        let endpoint;
        let parameters = {
            page: page
        };

        // Search by title
        if (currentSearchTerm) {
            endpoint = "/search/movie";

            parameters.query = currentSearchTerm;
            parameters.include_adult = false;

            if (currentYear) {
                parameters.primary_release_year = currentYear;
            }
        }

        // Browse a selected genre without searching
        else if (genreId) {
            endpoint = "/discover/movie";

            parameters.with_genres = genreId;
            parameters.sort_by = "popularity.desc";

            if (currentYear) {
                parameters.primary_release_year = currentYear;
            }
        }

        // Default homepage: popular movies
        else {
            endpoint = "/movie/popular";

            if (currentYear) {
                endpoint = "/discover/movie";
                parameters.primary_release_year = currentYear;
                parameters.sort_by = "popularity.desc";
            }
        }

        let loadingText = "Loading popular movies...";

        if (currentSearchTerm) {
            loadingText = "Searching for movies...";
        } else if (genreId) {
            loadingText = "Loading movies in this genre...";
        }

        showLoading(loadingText);

        searchRequest = tmdbRequest(endpoint, parameters)
            .done(function (response) {
                if (requestNumber !== activeRequestNumber) {
                    return;
                }

                let movies = response.results || [];

                // If a user searches and also selects a genre,
                // filter the search results by their genre IDs.
                if (currentSearchTerm && genreId) {
                    movies = movies.filter(movie =>
                        (movie.genre_ids || []).includes(genreId)
                    );
                }

                currentMovies = movies;

                totalPages = Math.min(response.total_pages || 1, 500);

                hideStatus();

                if (currentSearchTerm) {
                    $("#results-heading").text(
                        'Results for "' + currentSearchTerm + '"'
                    );
                } else if (genreId) {
                    $("#results-heading").text("Explore Movies by Genre");
                } else {
                    $("#results-heading").text("Popular Movies");
                }

                $("#results-subtitle").text(
                    "Choose a movie to explore its full details."
                );

                $("#results-count").text(
                    (response.total_results || movies.length) +
                    " movies found"
                );

                if (!movies.length) {
                    showMessage("No movies found. Try another search or genre.");
                    return;
                }

                applySorting();
                renderPagination();
            })
            .fail(function (xhr, state) {
                if (state !== "abort" && requestNumber === activeRequestNumber) {
                    let message = "Could not connect to TMDB. Please try again.";

                    if (xhr.status === 401) {
                        message = "Invalid TMDB token. Check your js/config.js file.";
                    } else if (xhr.status === 429) {
                        message = "Too many requests. Please wait and try again.";
                    }

                    showMessage(message, true);
                }
            })
            .always(function () {
                if (requestNumber === activeRequestNumber) {
                    searchRequest = null;
                }
            });
    }

    // ==========================================
    // 6. SORTING
    // ==========================================

    function applySorting() {
        sortAndDisplay(currentMovies);
    }

    function sortAndDisplay(sourceMovies) {
        const list = [...sourceMovies];
        const sort = $("#sort-select").val();

        if (sort === "title-asc") {
            list.sort((a, b) =>
                (a.title || "").localeCompare(b.title || "")
            );
        }

        if (sort === "title-desc") {
            list.sort((a, b) =>
                (b.title || "").localeCompare(a.title || "")
            );
        }

        if (sort === "year-newest") {
            list.sort((a, b) =>
                yearNumber(b.release_date) - yearNumber(a.release_date)
            );
        }

        if (sort === "year-oldest") {
            list.sort((a, b) =>
                yearNumber(a.release_date) - yearNumber(b.release_date)
            );
        }

        displayMovies(list, $grid);
    }

    // ==========================================
    // 7. DISPLAY MOVIE CARDS
    // ==========================================

    function displayMovies(list, $target) {
        $target.empty();

        if (!list.length) {
            return;
        }

        list.forEach(movie => {
            const poster = movie.poster_path
                ? IMAGE_BASE + movie.poster_path
                : "";

            const saved = isFavorite(movie.id);

            const title = movie.title || "Untitled Movie";

            const $card = $("<article>")
                .addClass("movie-card")
                .attr("data-id", movie.id);

            const $visual = $("<div>").addClass("poster");

            if (poster) {
                $("<img>")
                    .attr({
                        src: poster,
                        alt: title + " poster",
                        loading: "lazy"
                    })
                    .on("error", function () {
                        $(this).replaceWith(
                            '<div class="no-poster">🎬<small>Poster unavailable</small></div>'
                        );
                    })
                    .appendTo($visual);
            } else {
                $visual.html(
                    '<div class="no-poster">🎬<small>Poster unavailable</small></div>'
                );
            }

            $("<button>")
                .addClass("heart" + (saved ? " saved" : ""))
                .attr({
                    type: "button",
                    "aria-label": saved
                        ? "Remove from favorites"
                        : "Add to favorites"
                })
                .text(saved ? "♥" : "♡")
                .on("click", function (event) {
                    event.stopPropagation();
                    toggleFavorite(movie);
                })
                .appendTo($visual);

            const $info = $("<div>").addClass("movie-info");

            $("<small>")
                .addClass("tag")
                .text("MOVIE")
                .appendTo($info);

            $("<h3>")
                .text(title)
                .appendTo($info);

            const $bottom = $("<div>").addClass("card-bottom");

            $("<span>")
                .text(getMovieYear(movie))
                .appendTo($bottom);

            $("<button>")
                .addClass("details-link")
                .attr("type", "button")
                .text("Details ↗")
                .appendTo($bottom);

            $info.append($bottom);
            $card.append($visual, $info);

            $card.on("click", function () {
                getMovieDetails(movie.id);
            });

            $target.append($card);
        });
    }

    // ==========================================
    // 8. PAGINATION
    // ==========================================

    function renderPagination() {
        $pagination.empty();

        if (totalPages <= 1) {
            return;
        }

        $("<button>")
            .addClass("page-btn")
            .text("← Previous")
            .prop("disabled", currentPage === 1)
            .on("click", function () {
                loadMovies(currentPage - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            })
            .appendTo($pagination);

        $("<span>")
            .text("Page " + currentPage + " of " + totalPages)
            .appendTo($pagination);

        $("<button>")
            .addClass("page-btn")
            .text("Next →")
            .prop("disabled", currentPage >= totalPages)
            .on("click", function () {
                loadMovies(currentPage + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            })
            .appendTo($pagination);
    }

    // ==========================================
    // 9. MOVIE DETAILS MODAL
    // ==========================================

    function openModal() {
        $modal.addClass("open").attr("aria-hidden", "false");
        $("body").addClass("modal-open");
        $(".close").trigger("focus");
    }

    function closeModal() {
        if (detailRequest) {
            detailRequest.abort();
            detailRequest = null;
        }

        $modal.removeClass("open").attr("aria-hidden", "true");
        $("body").removeClass("modal-open");
    }

    function getMovieDetails(id) {
        if (detailRequest) {
            detailRequest.abort();
        }

        openModal();

        $modalContent.html(
            '<div class="modal-loading">' +
            '<span class="spinner"></span>' +
            '<p>Loading movie details...</p>' +
            '</div>'
        );

        detailRequest = tmdbRequest("/movie/" + id, {
            append_to_response: "credits"
        })
            .done(function (movie) {
                displayDetails(movie);
            })
            .fail(function (xhr, state) {
                if (state !== "abort") {
                    $modalContent.text(
                        "Could not load movie details. Please try again."
                    );
                }
            })
            .always(function () {
                detailRequest = null;
            });
    }

    function displayDetails(movie) {
        const poster = movie.poster_path
            ? IMAGE_BASE + movie.poster_path
            : "";

        const $layout = $("<div>").addClass("detail-layout");

        const $image = $("<div>").addClass("detail-image");

        if (poster) {
            $("<img>")
                .attr({
                    src: poster,
                    alt: movie.title + " poster"
                })
                .appendTo($image);
        } else {
            $image.html(
                '<div class="no-poster">🎬<small>Poster unavailable</small></div>'
            );
        }

        const $copy = $("<div>").addClass("detail-copy");

        $("<p>")
            .addClass("eyebrow light")
            .text("MOVIE · " + getMovieYear(movie))
            .appendTo($copy);

        $("<h2>")
            .attr("id", "modal-title")
            .text(movie.title || "Untitled Movie")
            .appendTo($copy);

        $("<p>")
            .addClass("rating")
            .text(
                movie.vote_average
                    ? "★ " + movie.vote_average.toFixed(1) + "/10 TMDB"
                    : "Rating unavailable"
            )
            .appendTo($copy);

        const director = (movie.credits?.crew || [])
            .find(person => person.job === "Director");

        const cast = (movie.credits?.cast || [])
            .slice(0, 5)
            .map(person => person.name)
            .join(", ");

        const genres = (movie.genres || [])
            .map(genre => genre.name)
            .join(", ");

        const fields = [
            ["Released", movie.release_date],
            ["Runtime", movie.runtime ? movie.runtime + " minutes" : ""],
            ["Genre", genres],
            ["Director", director ? director.name : ""],
            ["Cast", cast],
            ["Language", movie.original_language?.toUpperCase()],
            ["Status", movie.status]
        ];

        const $meta = $("<div>").addClass("meta");

        fields.forEach(([label, value]) => {
            if (value) {
                const $p = $("<p>");

                $("<b>")
                    .text(label + ": ")
                    .appendTo($p);

                $p.append(document.createTextNode(value));
                $meta.append($p);
            }
        });

        $copy.append($meta);

        if (movie.overview) {
            $("<h3>")
                .text("Synopsis")
                .appendTo($copy);

            $("<p>")
                .addClass("plot")
                .text(movie.overview)
                .appendTo($copy);
        }

        $("<button>")
            .addClass("button detail-heart")
            .attr("type", "button")
            .text(
                isFavorite(movie.id)
                    ? "♥ Saved to favorites"
                    : "♡ Add to favorites"
            )
            .on("click", function () {
                toggleFavorite(movie);

                $(this).text(
                    isFavorite(movie.id)
                        ? "♥ Saved to favorites"
                        : "♡ Add to favorites"
                );
            })
            .appendTo($copy);

        $layout.append($image, $copy);

        $modalContent.empty().append($layout);

        // Optional movie backdrop
        if (movie.backdrop_path) {
            $modalContent.css({
                backgroundImage:
                    "linear-gradient(rgba(10,10,20,.92), rgba(10,10,20,.97)), url(" +
                    BACKDROP_BASE + movie.backdrop_path + ")",
                backgroundSize: "cover",
                backgroundPosition: "center"
            });
        } else {
            $modalContent.css("background-image", "none");
        }
    }

    // ==========================================
    // 10. SEARCH FORM
    // ==========================================

    $("#search-form").on("submit", function (event) {
        event.preventDefault();

        const term = $("#search-input").val().trim();
        const year = $("#year-filter").val().trim();

        if (year && (!/^\d{4}$/.test(year) || +year < 1888 || +year > 2099)) {
            showMessage("Please enter a valid four-digit release year.", true);
            return;
        }

        currentSearchTerm = term;
        searchMovies(term, 1, year);
    });

    // ==========================================
    // 11. YEAR FILTER
    // ==========================================

    $("#year-filter").on("change", function () {
        const year = $(this).val().trim();

        if (year && (!/^\d{4}$/.test(year) || +year < 1888 || +year > 2099)) {
            showMessage("Please enter a valid four-digit release year.", true);
            return;
        }

        searchMovies(currentSearchTerm, 1, year);
    });

    // ==========================================
    // 12. GENRE FILTER
    // ==========================================

    $("#genre-filter").on("change", function () {
        searchMovies(currentSearchTerm, 1, currentYear);
    });

    // ==========================================
    // 13. SORTING
    // ==========================================

    $("#sort-select").on("change", applySorting);

    // ==========================================
    // 14. RESET FILTERS
    // ==========================================

    $("#reset-filters").on("click", function () {
        $("#year-filter").val("");
        $("#sort-select").val("default");
        $("#genre-filter").val("all");

        currentYear = "";

        searchMovies(currentSearchTerm, 1, "");
    });

    // ==========================================
    // 15. CLEAR FAVORITES
    // ==========================================

    $("#clear-favorites").on("click", function () {
        if (
            favorites().length &&
            confirm("Remove all saved movies from your favorites?")
        ) {
            saveFavorites([]);
        }
    });

    // ==========================================
    // 16. MODAL EVENTS
    // ==========================================

    $(".close, .backdrop").on("click", closeModal);

    $(document).on("keydown", function (event) {
        if (event.key === "Escape" && $modal.hasClass("open")) {
            closeModal();
        }
    });

    // ==========================================
    // 17. INITIALIZE APPLICATION
    // ==========================================

    renderFavorites();

    // Load popular movies immediately when the page opens.
    loadMovies(1);
});