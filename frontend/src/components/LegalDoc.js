import React from 'react';
import { FaFilePdf } from 'react-icons/fa'; 
import logo from '../Assets/unicef_logo.png'; 

const LegalDoc = () => {
  return (
    <div className="w-full p-6 bg-gray-100" style={{ fontFamily: 'roboto' }}>
      <div className="flex justify-center text-center mt-3 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-5xl font-extrabold text-gray-800">
          Child Rights <span className="text-blue-500">ADVOCACY</span>
        </h1>
      </div>
      <div className="bg-white shadow-md p-6 rounded-lg">
        <div className="mt-6">
          <h2 className="font-bold text-lg mb-3">Legal Documents</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <FaFilePdf className="w-10 h-10 text-red-600" />
              <div>
                <p className="font-semibold">UNCRC</p>
                <p className="text-sm">United Nations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaFilePdf className="w-10 h-10 text-red-600" />
              <div>
                <p className="font-semibold">National Law Book</p>
                <p className="text-sm">National</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-3">Website Tools</h2>
          <div className="flex space-x-6">
            <a href="https://www.hrw.com" className="text-gray-700 underline">www.hrw.com</a>
            <a href="https://www.unicef.org" className="text-gray-700 underline">www.unicef.org</a>
            <a href="https://www.parliament.gov.rw" className="text-gray-700 underline">www.parliament.gov.rw</a>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="font-bold text-lg mb-3">Legal Approach Guidelines</h2>

          <div className="bg-gray-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">If you suspect child abuse:</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Report it. In most places, it's mandatory for certain professions (teachers, doctors, counselors) to report suspected abuse.</li>
              <li>Call local child protective services or National Child Abuse Hotline (1-800-422-4453).</li>
              <li>Gather evidence (photos, witness statements) but prioritize the child's safety.</li>
              <li>If the child is in immediate danger, call 911.</li>
            </ul>
          </div>

          <div className="bg-gray-200 p-4 mt-4 rounded-lg">
            <h3 className="font-bold mb-2">General legal information:</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Understand types of child abuse: physical, sexual, emotional, and neglect.</li>
              <li>Legal definitions can vary by location, and reporting requirements vary by local laws.</li>
              <li>Seek legal guidance from a specialized lawyer in child abuse cases for advice on your specific situation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDoc;
