import * as brokerService from "../services/brokerService.js";

// GET /api/brokers?search=
export async function getBrokers(req, res) {
  try {
    const brokers = await brokerService.getBrokers(req.query);

    return res.status(200).json({
      success: true,
      count: brokers.length,
      data: brokers,
    });
  } catch (error) {
    if (error instanceof brokerService.BrokerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to fetch brokers:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brokers",
    });
  }
}

// GET /api/brokers/:id
export async function getBrokerById(req, res) {
  try {
    const broker = await brokerService.getBrokerById(req.params.id);

    return res.status(200).json({
      success: true,
      data: broker,
    });
  } catch (error) {
    if (error instanceof brokerService.BrokerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to fetch broker:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch broker",
    });
  }
}

// POST /api/brokers
export async function createBroker(req, res) {
  try {
    const broker = await brokerService.createBroker(req.body);

    return res.status(201).json({
      success: true,
      data: broker,
    });
  } catch (error) {
    if (error instanceof brokerService.BrokerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to create broker:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create broker",
    });
  }
}

// PUT /api/brokers/:id
export async function updateBroker(req, res) {
  try {
    const broker = await brokerService.updateBroker(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: broker,
    });
  } catch (error) {
    if (error instanceof brokerService.BrokerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to update broker:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update broker",
    });
  }
}

// DELETE /api/brokers/:id
export async function deleteBroker(req, res) {
  try {
    await brokerService.deleteBroker(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Broker deleted",
    });
  } catch (error) {
    if (error instanceof brokerService.BrokerServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Failed to delete broker:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete broker",
    });
  }
}
