import type { RequestHandler } from "express";
import * as orderService from "../services/order.service.js";

export const createOrderController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const order = await orderService.createOrder(req.body);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdersController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const orders = await orderService.getOrders();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const order = await orderService.getOrderById(req.params.id as string);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      status,
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewOrderPaymentController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const order = await orderService.reviewOrderPayment(
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Payment reviewed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};