import Link from 'next/link';
import Image from 'next/image';
import { 
  Sprout, 
  FlaskConical, 
  Bug, 
  Cloud, 
  TrendingUp, 
  Camera, 
  Landmark,
  ArrowRight,
  Users,
  Smartphone,
  Brain,
  ClipboardList,
  BrainCircuit
} from 'lucide-react';

const features = [
    {
      icon: Sprout,
      title: 'Crop Advisor',
      description: 'Get AI-powered crop recommendations based on your soil, climate, and farming conditions.',
      href: '/crop-advisor',
      color: 'bg-green-500'
    },
    {
      icon: FlaskConical,
      title: 'Fertilizer Guide',
      description: 'Receive personalized fertilizer recommendations for optimal crop growth and soil health.',
      href: '/fertilizer-soil',
      color: 'bg-blue-500'
    },
    {
      icon: Bug,
      title: 'Pest Control',
      description: 'Identify and treat pests and diseases with expert guidance and organic solutions.',
      href: '/pest-disease',
      color: 'bg-red-500'
    },
    {
      icon: Cloud,
      title: 'Weather Watch',
      description: 'Stay updated with real-time weather forecasts and agricultural alerts.',
      href: '/weather-watch',
      color: 'bg-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Market Prices',
      description: 'Track market prices and get yield estimates to maximize your profits.',
      href: '/market-yield',
      color: 'bg-orange-500'
    },
    {
      icon: Camera,
      title: 'Disease Detection',
      description: 'Upload crop images for instant disease identification and treatment advice.',
      href: '/disease-detection',
      color: 'bg-purple-500'
    },
    {
      icon: Landmark,
      title: 'Government Schemes',
      description: 'Find eligible subsidies and government schemes for your farming needs.',
      href: '/govt-schemes',
      color: 'bg-indigo-500'
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Ask questions and get answers from fellow farmers and agri-experts.',
      href: '/community',
      color: 'bg-yellow-500'
    }
];

export default function Home() {
    return (
        <div>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-20 overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0">
                <Image 
                  src="https://placehold.co/1920x1080.png" 
                  alt="farm field background" 
                  layout="fill" 
                  objectFit="cover" 
                  className="opacity-20" 
                  data-ai-hint="farm field"
                  priority
                />
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Welcome to <span className="text-green-300">AgriMitraAI</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
                  Your AI-powered agricultural advisor designed specifically for small farmers. 
                  Get expert guidance for crops, fertilizers, pest control, and more.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/crop-advisor"
                    className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Sprout className="h-5 w-5" />
                    <span>Start with Crop Advice</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors">
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Simple Steps to a Better Harvest
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Get expert farming advice in just a few clicks. Here’s how our AI helps you succeed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                    <ClipboardList className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Share Your Details</h3>
                  <p className="text-gray-600">
                    Tell us about your farm—your location, soil type, and the crops you're considering. The more details you provide, the better the advice.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
                    <BrainCircuit className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Get AI Analysis</h3>
                  <p className="text-gray-600">
                    Our AI analyzes millions of data points, including local weather, market trends, and soil health, to generate tailored recommendations.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="bg-orange-100 text-orange-600 p-4 rounded-full mb-4">
                    <Sprout className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Farm with Confidence</h3>
                  <p className="text-gray-600">
                    Receive clear, actionable advice on fertilizers, pest control, and when to sell to maximize your yield and profits.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Complete Agricultural Solutions
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Everything you need to make informed farming decisions, from crop selection to market analysis.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <Link
                    key={index}
                    href={feature.href}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 group flex flex-col"
                  >
                    <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4 group-hover:scale-110 transition-transform self-start`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-grow">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Why Choose AgriMitraAI?
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Built specifically for small farmers in India, AgriMitraAI combines traditional farming wisdom 
                    with modern AI technology to provide actionable insights.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Brain className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                        <p className="text-gray-600">Advanced AI algorithms provide personalized recommendations based on your specific conditions.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Smartphone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile-First Design</h3>
                        <p className="text-gray-600">Optimized for smartphones with offline capabilities for rural areas.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Peer-to-Peer Forum</h3>
                        <p className="text-gray-600">Ask questions and get trusted answers from a community of verified farmers and agri-experts. Your contributions help build a trusted knowledge base for everyone.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative h-[400px] lg:h-auto min-h-[300px]">
                    <Image
                        src="https://placehold.co/800x600.png"
                        alt="Farmer using technology"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-2xl shadow-xl"
                        data-ai-hint="farmer technology"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent rounded-2xl"></div>
                </div>

              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-green-600 to-green-800 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Farming?
              </h2>
              <p className="text-xl text-green-100 mb-8">
                Join thousands of farmers who are already using AgriMitraAI to increase their yields and profits.
              </p>
              <Link
                href="/crop-advisor"
                className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center space-x-2"
              >
                <Sprout className="h-5 w-5" />
                <span>Get Started Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </section>
        </div>
    );
}
