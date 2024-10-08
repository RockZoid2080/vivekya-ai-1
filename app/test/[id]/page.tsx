'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface Question {
  id: string;
  text: string;
}

interface TestReport {
  score: string;
  areas_to_improve: string;
  overall_feeadback: string;
  rating_out_of_5stars: number;
}

export default function TestPage() {
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [marks, setmarks] = useState(null)
  const [report, setReport] = useState<TestReport | null>(null);
  const params = useParams()

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true)
      console.log('Fetching questions for job ID:', params.id) 
      try {
        const response = await fetch('/api/getQuestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: params.id }),
        })

        console.log('Response status:', response.status)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Fetched data:', data) 
        setQuestions(data.questions)
      } catch (err) {
        setError('Error fetching questions')
        console.error('Fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [params.id])

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  }

  const handleSubmit = async() => {
    setLoading(true);
    const result = questions.map((question, index) => ({
      question,
      answer: answers[index] || ''
    }));
    try {
      const response = await axios.post('/api/submittest', { result })
      setReport(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Error submitting test');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test Questions</h1>
      {report ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Test Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your score: {report.score}</p>
            <p>Areas to improve: {report.areas_to_improve}</p>
            <p>Overall feedback: {report.overall_feeadback}</p>
            <p>Rating: {report.rating_out_of_5stars}/5</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">Question {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{question}</p>
                  <Textarea
                    placeholder="Your answer"
                    className="mt-2 h-32"
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                  />
                </CardContent>  
              </Card>
            ))}
          </div>
          <Button className="mt-6 bg-green-500 hover:bg-green-600" onClick={handleSubmit}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Test'}
          </Button>
        </>
      )}
    </div>
  )
}