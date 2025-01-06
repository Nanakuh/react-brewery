import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

const App = () => {
  const [breweries, setBreweries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]); // Estado para almacenar los países disponibles
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [breweriesPerPage] = useState(50); // Número de cervecerías por página

  // Función para obtener todas las cervecerías paginadas
  const fetchBreweries = async () => {
    let allBreweries = [];
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      try {
        let url = `https://api.openbrewerydb.org/breweries?page=${page}&per_page=50`; // Limitar a 50 cervecerías por página (ajustar si es necesario)

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Error fetching breweries");
        }
        const data = await response.json();

        if (data.length === 0) {
          hasMoreData = false; // No hay más datos
        } else {
          allBreweries = [...allBreweries, ...data]; // Añadir las cervecerías a la lista
          page += 1; // Siguiente página
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
        hasMoreData = false;
      }
    }

    setBreweries(allBreweries);
    setLoading(false);

    // Extraemos los países de todas las cervecerías
    const countriesSet = new Set(
      allBreweries.map((brewery) => brewery.country)
    );
    setCountries([...countriesSet]);
  };

  // Efecto para obtener las cervecerías y países al cargar la página
  useEffect(() => {
    fetchBreweries();
  }, []); // Solo se ejecuta una vez al cargar la página

  // Controlador del cambio en el select
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al cambiar el país
  };

  // Filtrar las cervecerías por país seleccionado o mostrar todas las cervecerías
  const filteredBreweries = country
    ? breweries.filter((brewery) => brewery.country === country)
    : breweries; // Si no hay país seleccionado, mostrar todas las cervecerías

  // Determinar el índice de las cervecerías que se deben mostrar en la página actual
  const indexOfLastBrewery = currentPage * breweriesPerPage;
  const indexOfFirstBrewery = indexOfLastBrewery - breweriesPerPage;
  const currentBreweries = filteredBreweries.slice(
    indexOfFirstBrewery,
    indexOfLastBrewery
  );

  // Cambiar a la siguiente página
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredBreweries.length / breweriesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
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
        <h2>Explore Breweries</h2>

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

        {loading && !error ? (
          <p>Loading breweries...</p>
        ) : error ? (
          <p className='error-message'>Error: {error}</p>
        ) : (
          <div className='grid-container'>
            {currentBreweries.map((brewery) => (
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

        {/* Paginación */}
        {filteredBreweries.length > breweriesPerPage && (
          <div className='pagination'>
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of{" "}
              {Math.ceil(filteredBreweries.length / breweriesPerPage)}
            </span>
            <button
              onClick={nextPage}
              disabled={
                currentPage ===
                Math.ceil(filteredBreweries.length / breweriesPerPage)
              }
            >
              Next
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
