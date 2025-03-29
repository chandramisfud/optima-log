import React, { FormEvent, Dispatch, SetStateAction } from "react";

interface LoginFormProps {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  error: string;
  handleSubmit: (e: FormEvent) => void;
}
const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  handleSubmit,
}) => {
  return (
    <div className="bg-green-100 p-6 rounded-3xl shadow-lg w-72">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-200 text-black font-semibold py-2 rounded-md hover:bg-blue-300 transition duration-200"
        >
          SIGN IN
        </button>
      </form>
    </div>
  );
};

// const LoginForm: React.FC<LoginFormProps> = ({
//   email,
//   setEmail,
//   password,
//   setPassword,
//   error,
//   handleSubmit,
// }) => {
//   return (
//     <div className="bg-green-100 p-8 rounded-lg shadow-lg w-full max-w-md">
//       <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">
//         WELCOME TO XVA LOG MANAGEMENT
//       </h1>
//       {error && <div className="text-red-500 text-center mb-4">{error}</div>}
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2" htmlFor="email">
//             Email
//           </label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
//             required
//           />
//         </div>
//         <div className="mb-6">
//           <label className="block text-gray-700 mb-2" htmlFor="password">
//             Password
//           </label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-200 text-blue-900 font-bold py-2 rounded hover:bg-blue-300 transition duration-200"
//         >
//           SIGN IN
//         </button>
//       </form>
//     </div>
//   );
// };

export default LoginForm;