
import React from 'react';
import Header from '@/components/Header';
import AddressInput from '@/components/AddressInput';

const Index = () => {
  return (
    <div className="min-h-screen bg-stargazer-darkbg">
      <div className="container mx-auto px-4">
        <Header />
        
        <main className="py-12 md:py-20 flex flex-col items-center">
          <div className="max-w-4xl w-full text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-gradient mb-6 animate-fade-in">
              Multi-Chain Blockchain Intelligence
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto animate-fade-in delay-150">
              Explore blockchain transactions across Ethereum, Bitcoin, Solana and TON networks.
              Visualize connections and track the flow of funds.
            </p>
            
            <div className="w-full">
              <AddressInput />
            </div>
          </div>
          
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in delay-300">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card rounded-xl p-6 backdrop-blur-xl bg-black/30 border border-white/10 shadow-lg hover:shadow-xl transition-all-cubic"
              >
                <div className="bg-gradient-to-br from-violet-400/20 to-violet-600/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const features = [
  {
    title: "Multi-Chain Support",
    description: "Analyze addresses across Ethereum, Bitcoin, Solana, and TON networks with a unified interface.",
    icon: (
      <svg className="w-6 h-6 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 16.5C21 16.8978 20.842 17.2794 20.5607 17.5607C20.2794 17.842 19.8978 18 19.5 18H4.5C4.10218 18 3.72064 17.842 3.43934 17.5607C3.15804 17.2794 3 16.8978 3 16.5V7.5C3 7.10218 3.15804 6.72064 3.43934 6.43934C3.72064 6.15804 4.10218 6 4.5 6H19.5C19.8978 6 20.2794 6.15804 20.5607 6.43934C20.842 6.72064 21 7.10218 21 7.5V16.5ZM4.5 4.5H19.5C20.2956 4.5 21.0587 4.81607 21.6213 5.37868C22.1839 5.94129 22.5 6.70435 22.5 7.5V16.5C22.5 17.2956 22.1839 18.0587 21.6213 18.6213C21.0587 19.1839 20.2956 19.5 19.5 19.5H4.5C3.70435 19.5 2.94129 19.1839 2.37868 18.6213C1.81607 18.0587 1.5 17.2956 1.5 16.5V7.5C1.5 6.70435 1.81607 5.94129 2.37868 5.37868C2.94129 4.81607 3.70435 4.5 4.5 4.5Z" />
        <path d="M12 15.75C13.6569 15.75 15 14.4069 15 12.75C15 11.0931 13.6569 9.75 12 9.75C10.3431 9.75 9 11.0931 9 12.75C9 14.4069 10.3431 15.75 12 15.75Z" />
      </svg>
    ),
  },
  {
    title: "Transaction Visualization",
    description: "See the flow of funds with interactive graph visualizations that highlight connections.",
    icon: (
      <svg className="w-6 h-6 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z" />
        <path d="M12 4.5C12.5967 4.5 13.169 4.73705 13.591 5.15901C14.0129 5.58097 14.25 6.15326 14.25 6.75C14.25 7.34674 14.0129 7.91903 13.591 8.34099C13.169 8.76295 12.5967 9 12 9C11.4033 9 10.831 8.76295 10.409 8.34099C9.98705 7.91903 9.75 7.34674 9.75 6.75C9.75 6.15326 9.98705 5.58097 10.409 5.15901C10.831 4.73705 11.4033 4.5 12 4.5ZM12 19.5C12.5967 19.5 13.169 19.2629 13.591 18.841C14.0129 18.419 14.25 17.8467 14.25 17.25C14.25 16.6533 14.0129 16.081 13.591 15.659C13.169 15.2371 12.5967 15 12 15C11.4033 15 10.831 15.2371 10.409 15.659C9.98705 16.081 9.75 16.6533 9.75 17.25C9.75 17.8467 9.98705 18.419 10.409 18.841C10.831 19.2629 11.4033 19.5 12 19.5ZM6.75 14.25C7.34674 14.25 7.91903 14.0129 8.34099 13.591C8.76295 13.169 9 12.5967 9 12C9 11.4033 8.76295 10.831 8.34099 10.409C7.91903 9.98705 7.34674 9.75 6.75 9.75C6.15326 9.75 5.58097 9.98705 5.15901 10.409C4.73705 10.831 4.5 11.4033 4.5 12C4.5 12.5967 4.73705 13.169 5.15901 13.591C5.58097 14.0129 6.15326 14.25 6.75 14.25ZM17.25 14.25C17.8467 14.25 18.419 14.0129 18.841 13.591C19.2629 13.169 19.5 12.5967 19.5 12C19.5 11.4033 19.2629 10.831 18.841 10.409C18.419 9.98705 17.8467 9.75 17.25 9.75C16.6533 9.75 16.081 9.98705 15.659 10.409C15.2371 10.831 15 11.4033 15 12C15 12.5967 15.2371 13.169 15.659 13.591C16.081 14.0129 16.6533 14.25 17.25 14.25Z" />
      </svg>
    ),
  },
  {
    title: "Balance & Asset Details",
    description: "Explore complete address balances and held assets with accurate valuations.",
    icon: (
      <svg className="w-6 h-6 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 6C12.5967 6 13.169 6.23705 13.591 6.65901C14.0129 7.08097 14.25 7.65326 14.25 8.25C14.25 8.84674 14.0129 9.41903 13.591 9.84099C13.169 10.2629 12.5967 10.5 12 10.5C11.4033 10.5 10.831 10.2629 10.409 9.84099C9.98705 9.41903 9.75 8.84674 9.75 8.25C9.75 7.65326 9.98705 7.08097 10.409 6.65901C10.831 6.23705 11.4033 6 12 6ZM6 13.5C6.59674 13.5 7.16903 13.7371 7.59099 14.159C8.01295 14.581 8.25 15.1533 8.25 15.75C8.25 16.3467 8.01295 16.919 7.59099 17.341C7.16903 17.7629 6.59674 18 6 18C5.40326 18 4.83097 17.7629 4.40901 17.341C3.98705 16.919 3.75 16.3467 3.75 15.75C3.75 15.1533 3.98705 14.581 4.40901 14.159C4.83097 13.7371 5.40326 13.5 6 13.5ZM18 13.5C18.5967 13.5 19.169 13.7371 19.591 14.159C20.0129 14.581 20.25 15.1533 20.25 15.75C20.25 16.3467 20.0129 16.919 19.591 17.341C19.169 17.7629 18.5967 18 18 18C17.4033 18 16.831 17.7629 16.409 17.341C15.9871 16.919 15.75 16.3467 15.75 15.75C15.75 15.1533 15.9871 14.581 16.409 14.159C16.831 13.7371 17.4033 13.5 18 13.5Z" />
      </svg>
    ),
  },
];

export default Index;
