import React from 'react';
import { Terminal, Database, Code, Search, MessageSquare, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

function VulnerabilityCard({ title, description, icon: Icon, link, color = "indigo" }: {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  color?: string;
}) {
  const colorClasses = {
    indigo: "text-indigo-600 bg-indigo-600 hover:bg-indigo-700",
    red: "text-red-600 bg-red-600 hover:bg-red-700",
    purple: "text-purple-600 bg-purple-600 hover:bg-purple-700",
    orange: "text-orange-600 bg-orange-600 hover:bg-orange-700"
  };

  return (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center mb-4">
          <Icon className={`w-6 h-6 ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} mr-3`} />
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
        <div className={`w-full text-white py-2 px-4 rounded-md transition-colors text-center font-medium ${colorClasses[color as keyof typeof colorClasses].split(' ').slice(1).join(' ')}`}>
          Test Vulnerability
        </div>
      </div>
    </Link>
  );
}

function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-4">Web Security Testing Laboratory</h2>
        <p className="text-xl opacity-90 max-w-3xl mx-auto">
          Practice identifying and exploiting common web vulnerabilities in a safe, controlled environment. 
          Learn about XSS, SQL Injection, and other security flaws that affect real-world applications.
        </p>
      </div>

      {/* Vulnerability Categories */}
      <div className="space-y-8">
        {/* XSS Vulnerabilities */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Code className="w-7 h-7 mr-3 text-red-500" />
            Cross-Site Scripting (XSS) Vulnerabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VulnerabilityCard
              title="Reflected XSS"
              description="Test for reflected Cross-Site Scripting vulnerabilities where malicious scripts are reflected back from user input"
              icon={Search}
              link="/reflected-xss"
              color="red"
            />
            <VulnerabilityCard
              title="Stored XSS"
              description="Test for stored/persistent Cross-Site Scripting attacks where malicious scripts are permanently stored on the server"
              icon={MessageSquare}
              link="/stored-xss"
              color="purple"
            />
            <VulnerabilityCard
              title="DOM-based XSS"
              description="Test for DOM-based Cross-Site Scripting vulnerabilities that occur entirely within the client-side code"
              icon={Hash}
              link="/dom-xss"
              color="orange"
            />
          </div>
        </div>

        {/* Injection Vulnerabilities */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Database className="w-7 h-7 mr-3 text-indigo-500" />
            Injection Vulnerabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VulnerabilityCard
              title="SQL Injection"
              description="Test SQL injection through a vulnerable comments system and learn to extract sensitive data"
              icon={Database}
              link="/sqli"
              color="indigo"
            />
          </div>
        </div>
      </div>

      {/* Educational Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Educational Guidelines</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• All vulnerabilities are intentionally implemented for learning purposes</li>
          <li>• Practice responsible disclosure and ethical hacking principles</li>
          <li>• Never attempt these techniques on real websites without explicit authorization</li>
          <li>• Use this knowledge to build more secure applications</li>
          <li>• Report real vulnerabilities through proper channels</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;