import PropTypes from "prop-types";
import "./NoResults.css";

/**
 * Component to display a message when no breweries are found.
 * @param {string} message - The message to display.
 */
const NoResults = ({
  message = "No breweries found. Please try another search!",
}) => {
  return (
    <div className='no-results-container'>
      <p className='no-results-message'>{message}</p>
    </div>
  );
};

NoResults.propTypes = {
  message: PropTypes.string,
};

export default NoResults;
