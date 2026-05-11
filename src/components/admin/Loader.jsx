import './Loader.css';

export default function Loader({ fullPage = false }) {
  return (
    <div className={`admin-loader-container ${fullPage ? 'full-page' : ''}`}>
      <div className="admin-spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
      </div>
    </div>
  );
}
