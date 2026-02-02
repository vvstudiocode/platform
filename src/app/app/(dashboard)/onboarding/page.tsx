'use client'

import { useActionState } from 'react'
import { createStore } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = {
    error: '',
}

export default function OnboardingPage() {
    const [state, formAction] = useActionState(createStore, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create your Store</CardTitle>
                    <CardDescription>
                        Let's get started! Give your store a name and choose your unique link.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Store Name</Label>
                            <Input id="name" name="name" placeholder="My Awesome Shop" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Store URL</Label>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-500 text-sm">https://</span>
                                <Input id="slug" name="slug" placeholder="my-shop" required className="flex-1" />
                                <span className="text-gray-500 text-sm">.yourdomain.com</span>
                            </div>
                            <p className="text-xs text-gray-400">Can only contain lowercase letters, numbers, and hyphens.</p>
                        </div>

                        {state?.error && (
                            <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
                                {state.error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Create Store</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
