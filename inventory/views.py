from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from inventory.serializers import ItemSerializer
from .models import *
import json


class ItemView(APIView):
    @staticmethod
    def get(request):
        # transform django objects to JSON (so it can be interpreted in the front-end_
        items = ItemSerializer(Item.objects.all(), many=True)
        # returns all item objects
        return Response(data={
            "items": items.data
        }, status=status.HTTP_200_OK)
        # Using bare status codes in your responses isn't recommended. REST framework
        # includes a set of named constants that you can use to make your code more obvious and readable.

    @staticmethod
    def post(request):
        # extracts the body from the request
        data = json.loads(request.body)

        # transforms JSON into python object
        # please read serializers.py Items serializer
        item_serializer = ItemSerializer(data=data)

        if item_serializer.is_valid():
            # Serializer class has a built in function that creates an object attributed to it
            # I pass the validated data and it creates the object
            item = item_serializer.create(validated_data=item_serializer.validated_data)

            return Response(data={
                'item_name': item.name
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": item_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        # audit trail add info on who deleted the item
        Item.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def put(request):
        # write edit functionality
        pass
