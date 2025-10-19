"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Eye, EyeOff, Github } from "lucide-react";

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (
      registerPassword &&
      confirmPassword &&
      registerPassword !== confirmPassword
    ) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
    }
  }, [registerPassword, confirmPassword]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-md relative z-10"
    >
      <Card className="p-8 bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-800 border-zinc-700">
            <TabsTrigger
              value="login"
              className="text-sm font-medium data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-400"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="text-sm font-medium data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 text-zinc-400"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0 space-y-6">
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-300 font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="your_username"
                    className="pl-11 h-12 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-11 pr-12 h-12 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-zinc-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-3 text-zinc-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 bg-zinc-800/50 hover:bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-600 transition-all duration-300"
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="register" className="mt-0 space-y-6">
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="username-register"
                  className="text-zinc-300 font-medium"
                >
                  Username
                </Label>
                <Input
                  id="username-register"
                  autoComplete="username"
                  placeholder="Choose a username"
                  className="h-12 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password-register"
                  className="text-zinc-300 font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password-register"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="h-12 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password-register"
                  className="text-zinc-300 font-medium"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password-register"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
                {passwordError && (
                  <p className="text-sm text-red-500 pt-1">{passwordError}</p>
                )}
              </div>

              <Button
                className="w-full h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all duration-300"
                disabled={isLoading || !!passwordError}
              >
                Create Account
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 bg-zinc-800/50 hover:bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-600"
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}
