import React from 'react';
import { Terminal, Database, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

function VulnerabilityCard({ title, description, icon: Icon, link }: {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
}) {
  return (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-4">
          <Icon className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-center">
          Test Vulnerability
        </div>
      </div>
    </Link>
  );
}

function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <VulnerabilityCard
        title="Reflected XSS"
        description="Test for reflected Cross-Site Scripting vulnerabilities"
        icon={Terminal}
        link="/reflected-xss"
      />
      <VulnerabilityCard
        title="Stored XSS"
        description="Test for stored/persistent Cross-Site Scripting attacks"
        icon={Database}
        link="/stored-xss"
      />
      <VulnerabilityCard
        title="DOM-based XSS"
        description="Test for DOM-based Cross-Site Scripting vulnerabilities"
        icon={Code}
        link="/dom-xss"
      />
      <VulnerabilityCard
        title="SQL Injection"
        description="Test SQL injection through a vulnerable comments system"
        icon={Database}
        link="/sqli"
      />
    </div>
  );
}

export default Home;