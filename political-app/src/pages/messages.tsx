// src/pages/messages.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const MessagesPage = () => {
  return (
    <ProtectedRoute>
      <MainLayout section="messages">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          <Tabs defaultValue="inbox">
            <TabsList className="mb-4">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inbox">
              <Card>
                <CardHeader>
                  <CardTitle>Inbox</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages in your inbox</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Messages from other users will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sent">
              <Card>
                <CardHeader>
                  <CardTitle>Sent Messages</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No sent messages</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Messages you send to others will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default MessagesPage;