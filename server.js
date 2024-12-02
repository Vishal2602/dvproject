import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000; // Use the dynamic port

// Middleware
app.use(helmet()); // Add security headers
app.use(cors()); // Enable CORS
app.use(express.static('public')); // Serve static files from 'public'

// API keys (use environment variables)
const fredApiKey = process.env.FRED_API_KEY || 'your-default-fred-api-key';
const tmdbApiKey = process.env.TMDB_API_KEY || 'your-default-tmdb-api-key';

// Route to fetch FRED data
app.get('/api/fred', async (req, res) => {
    const seriesId = 'GDP';
    const apiUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Error fetching data from FRED' });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching FRED data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to fetch inflation data
app.get('/api/inflation', async (req, res) => {
    const seriesId = 'CPIAUCSL';
    const apiUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Error fetching inflation data from FRED' });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching inflation data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to fetch top movies by revenue
app.get('/api/top-movies/all', async (req, res) => {
    const startYear = 2000; // Adjust the start year as needed
    const currentYear = new Date().getFullYear();
    const allTopMovies = {};

    try {
        for (let year = startYear; year <= currentYear; year++) {
            const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=revenue.desc&primary_release_year=${year}&page=1`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error fetching data for year ${year}`);
            }
            const data = await response.json();
            allTopMovies[year] = data.results.slice(0, 10); // Get top 10 movies
        }
        res.json(allTopMovies);
    } catch (error) {
        console.error('Error fetching top movies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fallback route for 404 errors
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
