import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FileUp, FilePlus, FileText } from "lucide-react";
//import { useNavigate } from 'react-router-dom';

export default function Medical() {
  //const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("No file selected");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        status: "error"
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const { data } = await axios.post("https://food-recommendation-using-ml.onrender.com/api/medical", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setExtractedText(data.extractedText);
      toast({
        title: "Success",
        description: "Medical document processed successfully!",
      });
    } catch (error) {
      console.error("❌ Upload failed:", error.response ? error.response.data : error.message);
      toast({
        title: "Error",
        description: "Failed to process the file. Check console for details."
      });
    }
    setLoading(false);
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 px-6 py-4 border-b border-green-500/20 shadow-lg shadow-green-500/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/home" className="text-xl font-bold flex items-center gap-2">
            <span className="text-green-500">N</span>ourish
          </a>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <a href="/home" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </a>
            <a href="/medical" className="nav-link flex items-center gap-2 text-green-500 font-medium">
              <FileText className="w-4 h-4" />
              <span>Medical</span>
            </a>
            <a href="/vitals" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Track Vitals</span>
            </a>
            <a href="/profile" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-green-500/20 shadow-xl fixed w-full z-40">
          <div className="flex flex-col space-y-4 p-4">
            <a href="/home" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </a>
            <a href="/medical" className="py-2 px-4 rounded-lg bg-green-500/10 flex items-center gap-3 text-green-500">
              <FileText className="w-5 h-5" />
              <span>Medical</span>
            </a>
            <a href="/vitals" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Track Vitals</span>
            </a>
            <a href="/profile" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-8 text-center lg:text-left">Medical Document Scanner</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Upload Section */}
          <div className="lg:w-1/2 space-y-8 animate-fade-in">
            <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
              <div className="flex items-center gap-3 mb-6">
                <FileUp className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-semibold">Upload Medical Document</h2>
              </div>

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-8 mb-6 hover:border-green-500/40 transition-all duration-300">
                <FilePlus className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-400 mb-6 text-center">
                  Upload your medical documents to extract important information
                </p>
                <p className="text-sm text-gray-500 mb-4">{fileName}</p>
                <label className="bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 inline-flex items-center gap-2 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Choose File
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className={`${
                    loading ? "bg-gray-600" : "bg-green-500 hover:bg-green-600"
                  } text-black font-medium px-8 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2 justify-center min-w-[200px]`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-5 w-5" />
                      Upload & Process
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:w-1/2 space-y-8 animate-fade-in">
            <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-semibold">Extracted Results</h2>
              </div>

              {extractedText ? (
                <div className="bg-gray-800 rounded-lg p-4 border border-green-500/10">
                  <h3 className="text-lg font-medium mb-2 text-green-400">Document Text</h3>
                  <p className="text-gray-300 whitespace-pre-line">{extractedText}</p>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 flex flex-col items-center justify-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400">Upload a medical document to see extracted text</p>
                </div>
              )}

              {/* {extractedText && (
                <div className="mt-6 flex justify-end">
                  <button className="bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Results
                  </button>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}