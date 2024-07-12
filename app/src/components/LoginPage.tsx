import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";

function LoginPage({
  setIsLoggedIn,
}: {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const [passwordAttempt, setPasswordAttempt] = useState("");

  const handleLoginAttempt = (event: FormEvent) => {
    event.preventDefault();
    if (passwordAttempt.trim() === process.env.REACT_APP_PASSWORD) {
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <form className="flex flex-col" onSubmit={handleLoginAttempt}>
        <input
          className="text-black border-2 border-black rounded"
          type="text"
          placeholder="password"
          value={passwordAttempt}
          onChange={(event) => setPasswordAttempt(event.target.value)}
        />
        <input className="text-black" type="submit" value="Login" />
      </form>
    </div>
  );
}

export default LoginPage;
