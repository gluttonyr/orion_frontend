import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { userService } from "../service/utilisateur.service";
import { toast } from "react-toastify";
export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    
    
        try {
         const user= await userService.login(
          email,
         password,
           
          );
          if (user){
            toast.success("conexion avec succes")
          } else{
            toast .error("email ou mots de passe incorect")
          }
   
          navigate("/dashboard");
        } catch (err: any) {
          toast .error("email ou mots de passe incorect")
        } finally {
          
        }
    
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-700 to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-white shadow-lg mb-4">
            <span className="text-3xl font-bold text-primary">O</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenue sur Orion</h1>
          <p className="text-blue-100">Votre plateforme de commerce en Afrique</p>
        </div>

        {/* Login Card */}
        <div className="bg-white shadow-xl p-8 border-4 border-white">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-primary hover:text-blue-700">Mot de passe oublié ?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg border-2 border-primary"
            >
              Se connecter
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-primary font-medium hover:text-blue-700">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 text-sm mt-6">
          Plateforme dédiée aux commerçants et entrepreneurs africains
        </p>
      </div>
    </div>
  );
}
