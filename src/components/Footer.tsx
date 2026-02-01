import { Facebook, Instagram, Mail } from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 lg:mb-12">
          {/* Opening Hours */}
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-4 lg:mb-6">HORAIRES D'OUVERTURE</h3>
            <div className="space-y-2">
              <p className="text-gray-400">Lun–Ven : 9h00 – 18h00</p>
              <p className="text-gray-400">Samedi : 9h00 – 16h00</p>
              <p className="text-gray-400">Dimanche : Fermé</p>
            </div>
          </div>

          {/* Address */}
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-4 lg:mb-6">ADRESSE</h3>
            <div className="space-y-2">
              <p className="text-gray-400">Algerie—Batna</p>
              <p className="text-gray-400">info@email.com</p>
              <p className="text-xl sm:text-2xl font-bold mt-3 lg:mt-4">0770844373</p>
              <p className="text-xl sm:text-2xl font-bold">0663660834</p>
            </div>
          </div>

          {/* Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-4 lg:mb-6">LIENS</h3>
            <div className="space-y-2">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors block">
                Accueil
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors block">
                À propos
              </Link>
              <Link to="/produits" className="text-gray-400 hover:text-white transition-colors block">
                Boutique
              </Link>
              <Link to="/news" className="text-gray-400 hover:text-white transition-colors block">
                Actualités
              </Link>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors block">
                Services
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-4 lg:mb-6">CONTACTEZ-NOUS</h3>
            <div className="flex justify-center md:justify-start gap-3 lg:gap-4">
              <button className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>

              <button className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <Mail className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>

              <button className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm text-center lg:text-left">
              <p>&copy; 2024 MY Shoes. Tous droits réservés.</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer