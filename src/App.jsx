import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";
import { COUNTRIES } from "./constants/Countries";
import NoResults from "./components/NoResults/NoResults";

const App = () => {
  const [breweries, setBreweries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState("");
  const [countries] = useState(COUNTRIES); // Estado para almacenar los países disponibles
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [breweriesPerPage] = useState(50); // Número de cervecerías por página
  const [hasNextPage, setHasNextPage] = useState(false);

  // Función para obtener todas las cervecerías paginadas
  const fetchBreweries = async () => {
    try {
      let url = `https://api.openbrewerydb.org/breweries?page=${currentPage}&per_page=${breweriesPerPage}`; // Limitar a 50 cervecerías por página (ajustar si es necesario)
      if (country !== "") {
        url = `https://api.openbrewerydb.org/breweries?page=${currentPage}&per_page=${breweriesPerPage}&by_country=${country}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error fetching breweries");
      }
      const data = await response.json();
      setBreweries(data);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }

    setLoading(false);
  };

  const calculateHasNextPage = () => {
    if (breweries.length < breweriesPerPage) {
      setHasNextPage(false);
    } else {
      setHasNextPage(true);
    }
  };

  // Efecto para obtener las cervecerías y países al cargar la página
  useEffect(() => {
    fetchBreweries();
  }, [country, currentPage]);

  useEffect(() => {
    calculateHasNextPage();
  }, [breweries]);

  // Controlador del cambio en el select
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al cambiar el país
  };

  // Cambiar a la siguiente página
  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  // Cambiar a la página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <Header />
      <main className='main-container'>
        <div>
          {/* Paginación */}

          <div className='pagination'>
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button onClick={nextPage} disabled={hasNextPage ? false : true}>
              Next
            </button>
          </div>

          {/* Menú desplegable para elegir el país, dinámicamente basado en los países de la API */}
          <div className='select-container'>
            <label htmlFor='country-select' className='filter'>
              Filter by Country:
            </label>
            <select
              id='country-select'
              value={country}
              onChange={handleCountryChange}
            >
              <option value=''>Select a Country</option>
              {countries
                .sort() // Ordena el arreglo de países alfabéticamente
                .map((countryOption, index) => (
                  <option key={index} value={countryOption}>
                    {countryOption || "Select a Country"}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {loading && !error ? (
          <p>Loading breweries...</p>
        ) : error ? (
          <p className='error-message'>Error: {error}</p>
        ) : breweries.length === 0 ? (
          <NoResults />
        ) : (
          <div className='grid-container'>
            {breweries.map((brewery) => (
              <div key={brewery.id} className='card'>
                <h3>{brewery.name} 🍻</h3>
                <p>
                  <strong>Type:</strong> {brewery.brewery_type}
                </p>
                <p>
                  <strong>Address:</strong> {brewery.street}, {brewery.city},{" "}
                  {brewery.state}, {brewery.postal_code}
                </p>
                <p>
                  <strong>Country:</strong> {brewery.country}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
