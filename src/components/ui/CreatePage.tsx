'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
type FormInput = {
    repoUrl: string
    projectName: string

    // optional
    githubToken?: string
}

const CreatePage = () => {
    const {register, handleSubmit, reset} = useForm<FormInput>()  
    function onSubmit(data: FormInput) {
        window.alert(data)
        return true
    }
  return (
    <div className='flex flex-col items-center gap-12 h-full text-center justify-center text-white'>
        <h1 className='text-2xl font-semibold'>
            Link your GitHub repository
        </h1>
        <p className='text-sm text-center text-muted-foreground'>
            Enter the URL of the GitHub repository to link it to Nyx
        </p>
        <div className='h-4'></div>

            <div>
                <form onSubmit={handleSubmit(onSubmit)}>

                </form>
            </div>
    </div>
  )
}

export default CreatePage