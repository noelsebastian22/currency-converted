import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function CsvReader() {
  const [csvFile, setCsvFile] = useState();
  const [csvArray, setCsvArray] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [toCurrency, setToCurrency] = useState();
  const [rates, setRates] = useState([]);

  const apiKey = "2f5607e46f3443998242ab193ae40c70";
  const baseUrl = "http://api.exchangeratesapi.io/v1/";

  const conversionUrl = `${baseUrl}convert?access_key = ${apiKey}`;

  useEffect(() => {
    fetch(`${baseUrl}latest?access_key=${apiKey}`).then((result) =>
      result.json().then((data) => {
        const firstCurrency = Object.keys(data.rates)[0];
        setCurrencyOptions(Object.keys(data.rates));
        setToCurrency(firstCurrency);
        setRates(data.rates);
      })
    );
  }, []);

  const processCSV = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        convertCurrency(results.data);
      },
    });
  };

  const submit = () => {
    const file = csvFile;
    processCSV(file);
  };

  const convertCurrency = (csvArray) => {
    const convertedData = csvArray.map((data) => {
      let convertedAmount = (
        (data.Amount / rates[data.Currency]) *
        rates[toCurrency]
      ).toFixed(2);
      return { ...data, convertedCurrency: toCurrency, convertedAmount };
    });
    setCsvArray(convertedData);
    console.log(convertedData);
  };

  const handleCurrencyChange = (e) => {
    console.log(e);
    setToCurrency(e.target.value);
  };

  const downloadCsvFile = () => {
    const data = Papa.unparse(csvArray);
    const blob = new Blob([data]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "CSV Export File";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log(data);
  };

  return (
    <div className="container text-center">
      <h1>Currency converter</h1>
      <form id="csv-form">
        <div className="row m-3">
          <input
            className="btn btn-secondary"
            type="file"
            accept=".csv"
            id="csvFile"
            onChange={(e) => {
              setCsvFile(e.target.files[0]);
            }}
          ></input>
        </div>
        <div className="row mb-3">
          <div className="col-6">
            <label className="mx-2">To Currency</label>
            <select value={toCurrency} onChange={handleCurrencyChange}>
              {currencyOptions.map((option) => (
                <option key={option + "to"} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <br />
        </div>
        <div className="row d-inline-flex">
          <button
            className="btn btn-primary mb-3"
            onClick={(e) => {
              e.preventDefault();
              if (csvFile) submit();
            }}
          >
            Submit
          </button>
          {csvArray.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                downloadCsvFile();
              }}
            >
              Download
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
