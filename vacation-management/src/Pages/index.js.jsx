import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Calendar, Users, Clock, Shield } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter