"use client"
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggler } from './ui/ThemeToggler';
import { Button } from './ui/button';
import PeerStatus from './PeerStatus';

const Header = () => {
    const {isSignedIn} = useUser();
  return (
    <header className="flex items-center justify-between">
        <Link href="/" className='flex items-center space-x-2'>
            <div className='bg-[#018cfeec] w-fit'> 
                <Image 
                    src="/nebula-logo.png"
                    alt="nebula drive logo"
                    className='bg-blue-200 text-blue-500'
                    height={50}
                    width={50}
                />
            </div>
            <h1 className='font-bold text-2xl'>Nebula Drive</h1>
        </Link>
        <div className='px-5 flex space-x-3 items-center'>
            <PeerStatus />
            <ThemeToggler />
            {
                isSignedIn ? (
                    <UserButton afterSignOutUrl="/" />
                ) : (
                    <SignInButton afterSignInUrl="/dashboard" mode="modal">
                        <Button className="font-semibold text-lg">Sign In</Button>
                    </SignInButton>
                )
            }
        </div>
    </header>
  )
}

export default Header