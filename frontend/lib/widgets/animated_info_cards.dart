import 'package:flutter/material.dart';
import 'dart:async';

class AnimatedInfoCard {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  AnimatedInfoCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}

class AnimatedInfoCardsSlider extends StatefulWidget {
  const AnimatedInfoCardsSlider({super.key});

  @override
  State<AnimatedInfoCardsSlider> createState() =>
      _AnimatedInfoCardsSliderState();
}

class _AnimatedInfoCardsSliderState extends State<AnimatedInfoCardsSlider> {
  late PageController _pageController;
  int _currentIndex = 0;
  Timer? _timer;

  final List<AnimatedInfoCard> cards = [
    AnimatedInfoCard(
      title: '1K+ Happy Patients',
      description:
          'Trusted by over 1,000+ patients worldwide for chronic disease prediction',
      icon: Icons.people_outline_rounded,
      color: const Color(0xFF00D084),
    ),
    AnimatedInfoCard(
      title: 'AI-Powered Predictions',
      description:
          'Advanced machine learning algorithms to predict chronic diseases with high accuracy',
      icon: Icons.smart_toy_outlined,
      color: const Color(0xFF0EA5E9),
    ),
    AnimatedInfoCard(
      title: 'Bank-Level Security',
      description:
          'End-to-end encryption and HIPAA-compliant data protection for your privacy',
      icon: Icons.security_rounded,
      color: const Color(0xFF06B6D4),
    ),
    AnimatedInfoCard(
      title: 'Real-time Analytics',
      description:
          'Get instant insights into your health with comprehensive disease predictions',
      icon: Icons.analytics_outlined,
      color: const Color(0xFF14B8A6),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.92);
    _startAutoSlide();
  }

  void _startAutoSlide() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_currentIndex < cards.length - 1) {
        _currentIndex++;
      } else {
        _currentIndex = 0;
      }
      if (_pageController.hasClients) {
        _pageController.animateToPage(
          _currentIndex,
          duration: const Duration(milliseconds: 800),
          curve: Curves.easeOutQuart,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 200, // Slightly improved height
          child: PageView.builder(
            controller: _pageController,
            padEnds: true,
            onPageChanged: (index) {
              setState(() => _currentIndex = index % cards.length);
            },
            itemCount: cards.length,
            physics: const BouncingScrollPhysics(),
            itemBuilder: (context, index) {
              final card = cards[index];
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [card.color, card.color.withOpacity(0.85)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: card.color.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    children: [
                      // Decorative circle
                      Positioned(
                        right: -20,
                        top: -20,
                        child: Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.1),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: -30,
                        left: -10,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.1),
                          ),
                        ),
                      ),

                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Icon(
                                card.icon,
                                size: 32,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              card.title,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                letterSpacing: 0.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              card.description,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Colors.white,
                                height: 1.4,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            cards.length,
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutBack,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              height: 8,
              width: index == _currentIndex ? 24 : 8,
              decoration: BoxDecoration(
                color: index == _currentIndex
                    ? Colors
                          .white // White indicators for better visibility on dark backgrounds
                    : Colors.white.withOpacity(0.4),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
