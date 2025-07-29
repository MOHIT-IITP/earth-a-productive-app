import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export const handleError = (error : unknown) => {
  if(error instanceof Error){
    return {errorMessage : error.message};
  }else{
    return {errorMessage : "An unknown error occcured"};
  }
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
